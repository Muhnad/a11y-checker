import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.{test,integration-test}.ts'],
    testTimeout: 30_000, // integration tests launch a real browser
  },
});
