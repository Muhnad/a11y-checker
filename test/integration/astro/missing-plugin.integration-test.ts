import { cpSync, mkdirSync, mkdtempSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture } from '../../helpers.js';

// The plugin is an optional peer; simulate it not being installed next to a11y-checker.
vi.mock('eslint-plugin-astro', () => {
  throw new Error("Cannot find package 'eslint-plugin-astro'");
});

const astroProject = () => {
  const dir = mkdtempSync(join(tmpdir(), 'a11y-astro-'));
  cpSync(fixture('astro'), dir, { recursive: true });
  return dir;
};

describe('scan without eslint-plugin-astro next to a11y-checker', () => {
  it('warns that .astro files were skipped instead of reporting a clean result', async () => {
    const warnings: string[] = [];

    const findings = await scan(astroProject(), { onWarning: (w) => warnings.push(w) });

    expect(findings).toEqual([]);
    expect(warnings).toEqual([expect.stringContaining('npx a11y-checker init')]);
  });

  it('uses the plugin installed in the scanned project', async () => {
    const project = astroProject();
    mkdirSync(join(project, 'node_modules'));
    symlinkSync(new URL('../../../node_modules/eslint-plugin-astro', import.meta.url).pathname, join(project, 'node_modules/eslint-plugin-astro'));

    const findings = await scan(project);

    expect(findings).toEqual([expect.objectContaining({ ruleId: 'astro/jsx-a11y/alt-text' })]);
  });
});
