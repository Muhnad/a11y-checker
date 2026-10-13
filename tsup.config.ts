import { defineConfig } from 'tsup';

// eslint-plugin-react-native-a11y is a devDependency on purpose: tsup bundles devDependencies, so its code
// ships inside dist and users never hit its ESLint<=8 peer range. Its own runtime deps (jsx-ast-utils,
// ast-types-flow, @babel/runtime) are real dependencies, so they stay external instead of being bundled.
// The banner gives the ESM output a `require` for the CommonJS code inside that plugin.
const esmRequire = "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);";

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    target: 'node22',
    esbuildOptions(options, { format }) {
      if (format === 'esm') options.banner = { js: esmRequire };
    },
  },
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    target: 'node22',
    esbuildOptions(options) {
      options.banner = { js: esmRequire };
    },
  },
]);
