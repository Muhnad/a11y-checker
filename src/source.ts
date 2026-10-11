import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularParser from '@angular-eslint/template-parser';
import { ESLint, type Linter } from 'eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import rnA11y from 'eslint-plugin-react-native-a11y';
import tseslint from 'typescript-eslint';
import vueA11y from 'eslint-plugin-vuejs-accessibility';
import type { Finding } from './types.js';

const RN_DOCS = 'https://github.com/FormidableLabs/eslint-plugin-react-native-a11y';

const rnRules = Object.fromEntries(Object.keys(rnA11y.configs.all.rules).map((id) => [id, 'error'])) as Linter.RulesRecord;

const ngRules = Object.fromEntries(
  [
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
  ].map((id) => [`@angular-eslint/template/${id}`, 'error']),
) as Linter.RulesRecord;

const SKIP_DIRS = ['node_modules', 'dist', 'build', '.next', 'coverage', '.git'];
export const FULL_DOCUMENT = /<html[\s>]|<!doctype/i;

/** Every file under a directory, skipping dependency and build folders. Paths are absolute. */
function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => !f.split(sep).some((part) => SKIP_DIRS.includes(part)))
    .map((f) => join(dir, f));
}

/** Full HTML pages under a directory. They are rendered and checked with axe, not linted as template fragments. */
export function htmlDocuments(dir: string): string[] {
  return listFiles(dir).filter((f) => /\.html?$/i.test(f) && FULL_DOCUMENT.test(readFileSync(f, 'utf8')));
}

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
 * every install to carry it. Its config re-registers jsx-a11y (already registered here, which ESLint rejects)
 * and applies its `astro/jsx-a11y/*` rules to every file; those are kept to .astro files so JSX files are not
 * reported twice.
 */
async function loadAstro(): Promise<Linter.Config[] | undefined> {
  try {
    const { default: astro } = await import('eslint-plugin-astro');
    return astro.configs['flat/jsx-a11y-recommended'].map(({ plugins, ...rest }): Linter.Config => {
      const own = Object.fromEntries(Object.entries(plugins ?? {}).filter(([name]) => name !== 'jsx-a11y'));
      return {
        ...rest,
        ...(Object.keys(own).length && { plugins: own }),
        ...(rest.rules && !rest.files && { files: ['**/*.astro'] }),
      };
    });
  } catch {
    // ponytail: any load failure is treated as "not installed"; the caller warns that .astro files were skipped.
    return undefined;
  }
}

// Both plugins key on element names (`img`/`button` vs Touchable*/Image from react-native),
// so running both on every file does not cross-fire.
const makeConfig = (astroConfigs: Linter.Config[]): Linter.Config[] => [
  { ignores: SKIP_DIRS.map((d) => `**/${d}/**`) },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: { parser: tseslint.parser as Linter.Parser, parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  // Astro files get the wrapped astro/jsx-a11y rules below instead.
  { ...jsxA11y.flatConfigs.recommended, ignores: ['**/*.astro'] },
  { files: ['**/*.{js,jsx,ts,tsx}'], plugins: { 'react-native-a11y': rnA11y }, rules: rnRules },
  ...astroConfigs,
  ...vueA11y.configs['flat/recommended'],
  // Let `<script lang="ts">` in Vue files parse as TypeScript.
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser, ecmaFeatures: { jsx: false } } } },
  // Angular templates, and HTML fragments in general; the processor also lints inline `template:` strings.
  { files: ['**/*.component.ts'], processor: angularTemplate.processors!['extract-inline-html'] as Linter.Processor },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angularParser as Linter.Parser },
    plugins: { '@angular-eslint/template': angularTemplate as ESLint.Plugin },
    rules: ngRules,
  },
];

/** Lint a source file or directory (JS/JSX/TS/TSX, Vue, Astro, Angular templates, HTML fragments) with the a11y rules. */
export async function scanSource(path: string, onWarning: OnWarning = () => {}): Promise<Finding[]> {
  const isDir = statSync(path).isDirectory();
  const files = isDir ? listFiles(path) : [path];
  const astroFiles = files.filter((f) => extname(f).toLowerCase() === '.astro');
  const astroConfigs = astroFiles.length ? await loadAstro() : undefined;
  const eslint = new ESLint({
    cwd: isDir ? path : dirname(path),
    overrideConfigFile: true,
    overrideConfig: makeConfig(astroConfigs ?? []),
    errorOnUnmatchedPattern: false,
  });
  const pages = new Set(isDir ? htmlDocuments(path) : []);
  // For a file with no matching config ESLint returns only a "File ignored" warning; that is not a finding.
  const unmatched = (r: ESLint.LintResult) => r.messages.length > 0 && r.messages.every((m) => !m.ruleId && !m.fatal);
  const linted = (await eslint.lintFiles([isDir ? '.' : basename(path)])).filter((r) => !unmatched(r));
  const results = linted.filter((r) => !pages.has(r.filePath));
  let skipped = warnSkipped(files, onWarning);
  if (astroFiles.length && !astroConfigs) {
    onWarning(
      `Skipped ${astroFiles.length} .astro file(s): install eslint-plugin-astro (npm i -D eslint-plugin-astro) to lint them, or scan the running site's URL.`,
    );
    skipped = true;
  }
  if (!linted.length && !skipped) onWarning(`No files with source rules found in ${relative(process.cwd(), path) || '.'}.`);
  const meta = eslint.getRulesMetaForResults(results);

  return results.flatMap((r) =>
    r.messages.map((m): Finding => {
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
        file: relative(process.cwd(), r.filePath),
        line: m.line,
      };
    }),
  );
}
