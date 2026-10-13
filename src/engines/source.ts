import { statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ESLint, Linter } from 'eslint';
import { listFiles, htmlDocuments, SKIP_DIRS } from './files.js';
import type { Finding } from '../types.js';

export type OnWarning = (message: string) => void;

type RulesMeta = ReturnType<ESLint['getRulesMetaForResults']>;
type AstroModule = typeof import('eslint-plugin-astro');

const TEST_FILES = ['**/*.{test,spec}.*', '**/__tests__/**', '**/__mocks__/**'];

// `accessibilityHint` is optional guidance, not a failure; requiring it buries the real findings.
const RN_SKIPPED_RULES = new Set(['has-accessibility-hint']);
const RN_DOCS = 'https://github.com/FormidableLabs/eslint-plugin-react-native-a11y';

const UNSUPPORTED_TEMPLATES = /^\.(svelte|hbs|handlebars|ejs|pug|njk|liquid|twig|erb|mdx|marko)$/i;

const ANGULAR_TEMPLATE_RULES = [
  'alt-text',
  'click-events-have-key-events',
  'elements-content',
  'interactive-supports-focus',
  'label-has-associated-control',
  'mouse-events-have-key-events',
  'no-autofocus',
  'no-distracting-elements',
  'no-positive-tabindex',
  'role-has-required-aria',
  'table-scope',
  'valid-aria',
];

const extensionOf = (file: string) => extname(file).toLowerCase();
const asErrors = (ruleIds: string[]) => Object.fromEntries(ruleIds.map((id) => [id, 'error'])) as Linter.RulesRecord;

const skippedFilesWarning = (files: string[]): string | undefined => {
  const unsupported = files.map(extensionOf).filter((ext) => UNSUPPORTED_TEMPLATES.test(ext));
  const summary = [...new Set(unsupported)].map((ext) => `${unsupported.filter((e) => e === ext).length} ${ext}`).join(', ');
  return summary ? `Skipped files with no source rules (${summary}). Scan the running app's URL to check them.` : undefined;
};

const skippedAstroWarning = (astroFileCount: number): string =>
  `Skipped ${astroFileCount} .astro file(s): run npx a11y-checker init to install eslint-plugin-astro (or npm i -D a11y-checker eslint-plugin-astro), or scan the running site's URL.`;

const attempt = async <T>(load: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await load();
  } catch {
    return undefined;
  }
};

// Optional peer (see AGENTS.md), so it may be missing. Also looked up from the scanned directory, so a bare `npx a11y-checker` finds the project's copy.
const importAstro = async (from: string): Promise<AstroModule | undefined> =>
  (await attempt(() => import('eslint-plugin-astro'))) ??
  attempt(() => import(pathToFileURL(createRequire(join(from, 'noop.js')).resolve('eslint-plugin-astro')).href));

// The astro config registers jsx-a11y again, which ESLint rejects as a duplicate, and applies its rules to
// every file; both are undone so JSX files are not reported twice.
const forAstroFilesOnly = ({ plugins, ...rest }: Linter.Config): Linter.Config => {
  const ownPlugins = Object.fromEntries(Object.entries(plugins ?? {}).filter(([name]) => name !== 'jsx-a11y'));
  return {
    ...rest,
    ...(Object.keys(ownPlugins).length && { plugins: ownPlugins }),
    ...(rest.rules && !rest.files && { files: ['**/*.astro'] }),
  };
};

const loadAstroConfigs = async (from: string): Promise<Linter.Config[] | undefined> =>
  (await importAstro(from))?.default.configs['flat/jsx-a11y-recommended'].map(forAstroFilesOnly);

const loadTsParser = async () => ((await import('@typescript-eslint/parser')) as { default: Linter.Parser }).default;

// The two JSX plugins key on element names (`img`/`button` vs the react-native components), so running both on every file does not cross-fire.
async function reactConfigs(): Promise<Linter.Config[]> {
  const [{ default: jsxA11y }, { default: rnA11y }, tsParser] = await Promise.all([
    import('eslint-plugin-jsx-a11y'),
    import('eslint-plugin-react-native-a11y'),
    loadTsParser(),
  ]);
  const rnRuleIds = Object.keys(rnA11y.configs.all.rules).filter((id) => !RN_SKIPPED_RULES.has(id.replace('react-native-a11y/', '')));
  return [
    { files: ['**/*.{js,jsx,ts,tsx}'], languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } } },
    { ...jsxA11y.flatConfigs.recommended, ignores: ['**/*.astro'] },
    { files: ['**/*.{js,jsx,ts,tsx}'], plugins: { 'react-native-a11y': rnA11y }, rules: asErrors(rnRuleIds) },
  ];
}

async function vueConfigs(): Promise<Linter.Config[]> {
  const [{ default: vueA11y }, tsParser] = await Promise.all([import('eslint-plugin-vuejs-accessibility'), loadTsParser()]);
  return [
    ...vueA11y.configs['flat/recommended'],
    // Lets `<script lang="ts">` in Vue files parse as TypeScript.
    { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tsParser, ecmaFeatures: { jsx: false } } } },
  ];
}

// Also lints inline `template:` strings of .component.ts files.
async function angularConfigs(): Promise<Linter.Config[]> {
  const [{ default: angularTemplate }, { default: angularParser }] = await Promise.all([
    import('@angular-eslint/eslint-plugin-template'),
    import('@angular-eslint/template-parser'),
  ]);
  return [
    { files: ['**/*.component.ts'], processor: angularTemplate.processors!['extract-inline-html'] as Linter.Processor },
    {
      files: ['**/*.html'],
      languageOptions: { parser: angularParser },
      plugins: { '@angular-eslint/template': angularTemplate },
      rules: asErrors(ANGULAR_TEMPLATE_RULES.map((id) => `@angular-eslint/template/${id}`)),
    },
  ];
}

// Each plugin is imported only when a matching file exists: importing them is most of a scan's start-up time.
async function makeConfig(files: string[], astroConfigs: Linter.Config[]): Promise<Linter.Config[]> {
  const has = (pattern: RegExp) => files.some((f) => pattern.test(f));
  return [
    { ignores: [...SKIP_DIRS.map((dir) => `**/${dir}/**`), ...TEST_FILES] },
    ...(has(/\.(jsx?|tsx?)$/i) ? await reactConfigs() : []),
    ...astroConfigs,
    ...(has(/\.vue$/i) ? await vueConfigs() : []),
    ...(has(/\.(html?|component\.ts)$/i) ? await angularConfigs() : []),
  ];
}

// `../../x` is no use to someone else, so a file outside the working directory keeps its absolute path.
const shortPath = (file: string) => {
  const relativePath = relative(process.cwd(), file);
  return relativePath.startsWith('..') ? file : relativePath;
};

// For a file with no matching config ESLint returns only a "File ignored" notice, which is not a finding.
const isIgnoredNotice = (result: ESLint.LintResult) =>
  result.messages.length > 0 && result.messages.every((m) => !m.ruleId && !m.fatal);

// Rule-less messages are parse errors (fatal) or noise such as unused `eslint-disable` comments. The project's
// own disable comments can also name rules from plugins we do not load.
const isFinding = (message: Linter.LintMessage) =>
  Boolean(message.ruleId || message.fatal) && !/^Definition for rule .* was not found/.test(message.message);

function toFinding(filePath: string, message: Linter.LintMessage, meta: RulesMeta): Finding {
  const ruleId = message.ruleId ?? 'parse-error';
  return {
    engine: 'source',
    ruleId,
    // ponytail: ESLint rules carry no impact or WCAG tags; every finding is 'serious' with no wcag.
    impact: 'serious',
    wcag: [],
    message: message.message,
    helpUrl: meta[ruleId]?.docs?.url ?? (ruleId.startsWith('react-native-a11y/') ? RN_DOCS : ''),
    // The plugins' messages already say what to change.
    fixHint: message.message,
    file: shortPath(filePath),
    line: message.line,
  };
}

/** Lint a source file or directory (JS/JSX/TS/TSX, Vue, Astro, Angular templates, HTML fragments) with the a11y rules. */
export async function scanSource(path: string, onWarning: OnWarning = () => {}): Promise<Finding[]> {
  const isDirectory = statSync(path).isDirectory();
  const files = isDirectory ? listFiles(path) : [path];
  const astroFiles = files.filter((f) => extensionOf(f) === '.astro');
  const cwd = isDirectory ? path : dirname(path);
  const astroConfigs = astroFiles.length ? await loadAstroConfigs(cwd) : undefined;

  const { ESLint } = await import('eslint');
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: await makeConfig(files, astroConfigs ?? []),
    errorOnUnmatchedPattern: false,
    // Kept outside the project so no .eslintcache lands in the user's repo; the trailing separator makes ESLint
    // keep one cache file per working directory.
    cache: true,
    cacheLocation: join(tmpdir(), 'a11y-checker-cache') + sep,
  });
  const linted = (await eslint.lintFiles([isDirectory ? '.' : basename(path)])).filter((r) => !isIgnoredNotice(r));

  const warnings = [
    skippedFilesWarning(files),
    astroFiles.length && !astroConfigs ? skippedAstroWarning(astroFiles.length) : undefined,
  ].filter((warning) => warning !== undefined);
  if (!linted.length && !warnings.length) {
    warnings.push(`No files with source rules found in ${relative(process.cwd(), path) || '.'} (test, spec and mock files are ignored).`);
  }
  warnings.forEach(onWarning);

  // Full HTML pages are rendered and checked with axe instead (see scan.ts).
  const pages = new Set(isDirectory ? htmlDocuments(path) : []);
  const results = linted.filter((r) => !pages.has(r.filePath));
  const meta = eslint.getRulesMetaForResults(results);
  return results.flatMap((r) => r.messages.filter(isFinding).map((m) => toFinding(r.filePath, m, meta)));
}
