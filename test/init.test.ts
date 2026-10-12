import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { addAgentsBlock, plan } from '../src/init.js';

const project = (pkg: object, lockfile?: string) => {
  const dir = mkdtempSync(join(tmpdir(), 'a11y-init-'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg));
  if (lockfile) writeFileSync(join(dir, lockfile), '');
  return dir;
};

describe('init plan', () => {
  it('installs only a11y-checker for a React project', () => {
    expect(plan(project({ dependencies: { react: '19' } })).argv).toEqual(['npm', 'install', '-D', 'a11y-checker']);
  });

  it('adds the Astro plugin for an Astro project and uses the lockfile package manager', () => {
    const { argv } = plan(project({ dependencies: { astro: '5' } }, 'pnpm-lock.yaml'));

    expect(argv.slice(0, 3)).toEqual(['pnpm', 'add', '-D']);
    expect(argv.slice(3)).toEqual(['a11y-checker', expect.stringMatching(/^eslint-plugin-astro@\^1/)]);
  });

  it('installs nothing that is already a dependency', () => {
    const deps = { astro: '5', 'a11y-checker': '3', 'eslint-plugin-astro': '1' };

    expect(plan(project({ devDependencies: deps })).argv).toEqual([]);
  });

  it('points Svelte projects at a URL scan', () => {
    expect(plan(project({ dependencies: { svelte: '5' } })).notes).toEqual([expect.stringContaining('Svelte')]);
  });
});

describe('addAgentsBlock', () => {
  const agents = (dir: string) => join(dir, 'AGENTS.md');

  it('creates AGENTS.md with the a11y instructions', () => {
    const dir = project({});

    addAgentsBlock(dir);

    expect(readFileSync(agents(dir), 'utf8')).toContain('npx a11y-checker --changed --json');
  });

  it('keeps the existing content and adds the block after it', () => {
    const dir = project({});
    writeFileSync(agents(dir), '# Rules\n\nUse tabs.\n');

    addAgentsBlock(dir);

    expect(readFileSync(agents(dir), 'utf8')).toMatch(/^# Rules\n\nUse tabs\.\n\n<!-- a11y-checker:start -->/);
  });

  it('replaces its earlier block instead of adding a second one', () => {
    const dir = project({});
    writeFileSync(agents(dir), 'before\n\n<!-- a11y-checker:start -->\nold\n<!-- a11y-checker:end -->\n\nafter\n');

    addAgentsBlock(dir);
    addAgentsBlock(dir);

    const text = readFileSync(agents(dir), 'utf8');
    expect(text.match(/a11y-checker:start/g)).toHaveLength(1);
    expect(text).toMatch(/^before\n\n/);
    expect(text).toMatch(/\n\nafter\n$/);
    expect(text).not.toContain('old');
  });
});
