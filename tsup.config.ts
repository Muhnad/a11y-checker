import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    target: 'node22',
  },
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    target: 'node22',
  },
]);
