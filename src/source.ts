import { statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ESLint, Linter } from 'eslint';
import { listFiles, htmlDocuments, SKIP_DIRS } from './files.js';
import type { Finding } from './types.js';

// Tests and mocks are not shipped UI, so findings in them are noise.
const TEST_FILES = ['**/*.{test,spec}.*', '**/__tests__/**', '**/__mocks__/**'];

// `accessibilityHint` is optional guidance, not a failure; requiring it buries the real findings.
const RN_SKIP = new Set(['has-accessibility-hint']);

const RN_DOCS = 'https://github.com/FormidableLabs/eslint-plugin-react-native-a11y';

// Template formats we have no source rules for. A scan must say so instead of reporting a clean result.
const UNSUPPORTED = /^\.(svelte|hbs|handlebars|ejs|pug|njk|liquid|twig|erb|mdx|marko)$/i;

export type OnWarning = (message: string) => void;

function warnSkipped(files: string[], onWarning: OnWarning): boolean {
  const counts = new Map<string, number>();
  for (const f of files) {
    const ext = extname(f).toLowerCase();
    if (UNSUPPORTED.test(ext)) counts.set(ext, (counts.get(ext) ?? 0) + 1);
  }
  if (!counts.size) return false;
  const list = [...counts].map(([ext, n]) => `${n} ${ext}`).join(', ');
  onWarning(`Skipped files with no source rules (${list}). Scan the running app's URL to check them.`);
  return true;
}

/**
 * eslint-plugin-astro is an optional peer, loaded only when there are .astro files: the releases that work
 * with ESLint 9 depend on fast-glob, whose `braces` dependency has an unpatched advisory, and we do not want
 * every install to carry it. It is looked up from the scanned directory too, so `npx a11y-checker` finds the
 * copy installed in the project. Its config re-registers jsx-a11y (already registered here, which ESLint
 * rejects) and applies its `astro/jsx-a11y/*` rules to every file; those are kept to .astro files so JSX files
 * are not reported twice.
 */
async function loadAstro(from: string): Promise<Linter.Config[] | undefined> {
  let plugin: { default: { configs: { 'flat/jsx-a11y-recommended': Linter.Config[] } } };
  try {
    plugin = await import('eslint-plugin-astro');
  } catch {
    try {
      plugin = await import(pathToFileURL(createRequire(join(from, 'noop.js')).resolve('eslint-plugin-astro')).href);
    } catch {
      // ponytail: any load failure is treated as "not installed"; the caller warns that .astro files were skipped.
      return undefined;
    }
  }
  return plugin.default.configs['flat/jsx-a11y-recommended'].map(({ plugins, ...rest }): Linter.Config => {
    const own = Object.fromEntries(Object.entries(plugins ?? {}).filter(([name]) => name !== 'jsx-a11y'));
    return {
      ...rest,
      ...(Object.keys(own).length && { plugins: own }),
      ...(rest.rules && !rest.files && { files: ['**/*.astro'] }),
    };
  });
}

const NG_RULES = [
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

/**
 * The ESLint config for the kinds of file about to be linted. Each plugin is imported only when a matching file
 * exists, which is most of a scan's start-up time. Both JSX plugins key on element names (`img`/`button` vs
 * the react-native components), so running both on every file does not cross-fire.
 */
async function makeConfig(files: string[], astroConfigs: Linter.Config[]): Promise<Linter.Config[]> {
  const has = (re: RegExp) => files.some((f) => re.test(f));
  const config: Linter.Config[] = [{ ignores: [...SKIP_DIRS.map((d) => `**/${d}/**`), ...TEST_FILES] }];
  // Angular inline templates live in .component.ts files, which are also TypeScript.
  const needsParser = has(/\.(jsx?|tsx?|vue)$/i);
  const tsParser = needsParser ? ((await import('@typescript-eslint/parser')) as { default: Linter.Parser }).default : undefined;

  if (has(/\.(jsx?|tsx?)$/i)) {
    const [{ default: jsxA11y }, { default: rnA11y }] = await Promise.all([
      import('eslint-plugin-jsx-a11y'),
      import('eslint-plugin-react-native-a11y'),
    ]);
    const rnRules = Object.fromEntries(
      Object.keys(rnA11y.configs.all.rules)
        .filter((id) => !RN_SKIP.has(id.replace('react-native-a11y/', '')))
        .map((id) => [id, 'error']),
    ) as Linter.RulesRecord;
    config.push(
      { files: ['**/*.{js,jsx,ts,tsx}'], languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } } },
      // Astro files get the wrapped astro/jsx-a11y rules below instead.
      { ...jsxA11y.flatConfigs.recommended, ignores: ['**/*.astro'] },
      { files: ['**/*.{js,jsx,ts,tsx}'], plugins: { 'react-native-a11y': rnA11y }, rules: rnRules },
    );
  }
  config.push(...astroConfigs);
  if (has(/\.vue$/i)) {
    const { default: vueA11y } = await import('eslint-plugin-vuejs-accessibility');
    config.push(
      ...vueA11y.configs['flat/recommended'],
      // Let `<script lang="ts">` in Vue files parse as TypeScript.
      { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tsParser, ecmaFeatures: { jsx: false } } } },
    );
  }
  // Angular templates, and HTML fragments in general; the processor also lints inline `template:` strings.
  if (has(/\.(html?|component\.ts)$/i)) {
    const [{ default: angularTemplate }, { default: angularParser }] = await Promise.all([
      import('@angular-eslint/eslint-plugin-template'),
      import('@angular-eslint/template-parser'),
    ]);
    config.push(
      { files: ['**/*.component.ts'], processor: angularTemplate.processors!['extract-inline-html'] as Linter.Processor },
      {
        files: ['**/*.html'],
        languageOptions: { parser: angularParser },
        plugins: { '@angular-eslint/template': angularTemplate },
        rules: Object.fromEntries(NG_RULES.map((id) => [`@angular-eslint/template/${id}`, 'error'])) as Linter.RulesRecord,
      },
    );
  }
  return config;
}

// Relative to the working directory, unless the file lies outside it: `../../x` is no use to someone else.
const shortPath = (file: string) => {
  const rel = relative(process.cwd(), file);
  return rel.startsWith('..') ? file : rel;
};

/** Lint a source file or directory (JS/JSX/TS/TSX, Vue, Astro, Angular templates, HTML fragments) with the a11y rules. */
export async function scanSource(path: string, onWarning: OnWarning = () => {}): Promise<Finding[]> {
  const isDir = statSync(path).isDirectory();
  const files = isDir ? listFiles(path) : [path];
  const astroFiles = files.filter((f) => extname(f).toLowerCase() === '.astro');
  const cwd = isDir ? path : dirname(path);
  const astroConfigs = astroFiles.length ? await loadAstro(cwd) : undefined;
  const { ESLint } = await import('eslint');
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: await makeConfig(files, astroConfigs ?? []),
    errorOnUnmatchedPattern: false,
    // Outside the project so no .eslintcache lands in the user's repo; the trailing separator makes ESLint
    // keep one cache file per working directory.
    cache: true,
    cacheLocation: join(tmpdir(), 'a11y-checker-cache') + sep,
  });
  const pages = new Set(isDir ? htmlDocuments(path) : []);
  // For a file with no matching config ESLint returns only a "File ignored" warning; that is not a finding.
  const unmatched = (r: ESLint.LintResult) => r.messages.length > 0 && r.messages.every((m) => !m.ruleId && !m.fatal);
  const linted = (await eslint.lintFiles([isDir ? '.' : basename(path)])).filter((r) => !unmatched(r));
  // The project's own `eslint-disable` comments can name rules from plugins we do not load; that is not a finding.
  // Other rule-less messages (unused directives and the like) are not findings either; only a parse failure is.
  const ours = (m: Linter.LintMessage) => (m.ruleId || m.fatal) && !/^Definition for rule .* was not found/.test(m.message);
  const results = linted.filter((r) => !pages.has(r.filePath));
  let skipped = warnSkipped(files, onWarning);
  if (astroFiles.length && !astroConfigs) {
    onWarning(
      `Skipped ${astroFiles.length} .astro file(s): run npx a11y-checker init to install eslint-plugin-astro (or npm i -D a11y-checker eslint-plugin-astro), or scan the running site's URL.`,
    );
    skipped = true;
  }
  if (!linted.length && !skipped) onWarning(`No files with source rules found in ${relative(process.cwd(), path) || '.'} (test, spec and mock files are ignored).`);
  const meta = eslint.getRulesMetaForResults(results);

  return results.flatMap((r) =>
    r.messages.filter(ours).map((m): Finding => {
      const ruleId = m.ruleId ?? 'parse-error';
      const helpUrl = meta[ruleId]?.docs?.url ?? (ruleId.startsWith('react-native-a11y/') ? RN_DOCS : '');
      return {
        engine: 'source',
        ruleId,
        // ponytail: ESLint rules carry no impact or WCAG tags; every finding is 'serious' with no wcag.
        // A per-rule table can refine this if agents need prioritisation.
        impact: 'serious',
        wcag: [],
        message: m.message,
        helpUrl,
        // The plugins' messages already say what to change.
        fixHint: m.message,
        file: shortPath(r.filePath),
        line: m.line,
      };
    }),
  );
}
