import { statSync } from 'node:fs';
import { basename, dirname, relative } from 'node:path';
import { ESLint, type Linter } from 'eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import rnA11y from 'eslint-plugin-react-native-a11y';
import tseslint from 'typescript-eslint';
import type { Finding } from './types.js';

const RN_DOCS = 'https://github.com/FormidableLabs/eslint-plugin-react-native-a11y';

const rnRules = Object.fromEntries(Object.keys(rnA11y.configs.all.rules).map((id) => [id, 'error'])) as Linter.RulesRecord;

// Both plugins key on element names (`img`/`button` vs Touchable*/Image from react-native),
// so running both on every file does not cross-fire.
const config: Linter.Config[] = [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/coverage/**'] },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: { parser: tseslint.parser as Linter.Parser, parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  jsxA11y.flatConfigs.recommended,
  { files: ['**/*.{js,jsx,ts,tsx}'], plugins: { 'react-native-a11y': rnA11y }, rules: rnRules },
];

/** Lint a source file or directory (JS/JSX/TS/TSX) with the web and React Native a11y rules. */
export async function scanSource(path: string): Promise<Finding[]> {
  const isDir = statSync(path).isDirectory();
  const eslint = new ESLint({
    cwd: isDir ? path : dirname(path),
    overrideConfigFile: true,
    overrideConfig: config,
    errorOnUnmatchedPattern: false,
  });
  const results = await eslint.lintFiles([isDir ? '.' : basename(path)]);
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
