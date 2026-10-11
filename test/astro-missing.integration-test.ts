import { describe, expect, it, vi } from 'vitest';
import { scan } from '../src/index.js';

// The plugin is an optional peer; simulate it not being installed.
vi.mock('eslint-plugin-astro', () => {
  throw new Error("Cannot find package 'eslint-plugin-astro'");
});

describe('scan without eslint-plugin-astro', () => {
  it('warns that .astro files were skipped instead of reporting a clean result', async () => {
    const warnings: string[] = [];

    const findings = await scan(new URL('./fixtures/astro', import.meta.url).pathname, {
      onWarning: (w) => warnings.push(w),
    });

    expect(findings).toEqual([]);
    expect(warnings).toEqual([expect.stringContaining('install eslint-plugin-astro')]);
  });
});
