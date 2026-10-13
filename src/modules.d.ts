// None of these plugins ship types.
declare module '@angular-eslint/eslint-plugin-template' {
  import type { ESLint } from 'eslint';
  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module '@angular-eslint/template-parser' {
  import type { Linter } from 'eslint';
  const parser: Linter.Parser;
  export default parser;
}

declare module 'eslint-plugin-jsx-a11y' {
  import type { Linter } from 'eslint';
  const plugin: { flatConfigs: { recommended: Linter.Config } };
  export default plugin;
}

declare module 'eslint-plugin-react-native-a11y' {
  import type { ESLint } from 'eslint';
  const plugin: ESLint.Plugin & { configs: { all: { rules: Record<string, unknown> } } };
  export default plugin;
}

declare module 'eslint-plugin-vuejs-accessibility' {
  import type { Linter } from 'eslint';
  const plugin: { configs: { 'flat/recommended': Linter.Config[] } };
  export default plugin;
}

declare module 'eslint-plugin-astro' {
  import type { Linter } from 'eslint';
  const plugin: { configs: { 'flat/jsx-a11y-recommended': Linter.Config[] } };
  export default plugin;
}
