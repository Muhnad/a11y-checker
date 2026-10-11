// Neither plugin ships types.
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
