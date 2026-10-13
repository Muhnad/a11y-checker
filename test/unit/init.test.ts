import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { addAgentsBlock, init, plan } from '../../src/commands/init.js';

// The package manager is the boundary: no test should really install anything.
vi.mock('node:child_process', () => ({ spawnSync: vi.fn() }));
const installReturns = (result: object) => vi.mocked(spawnSync).mockReturnValue(result as ReturnType<typeof spawnSync>);

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

describe('addAgentsBlock with a broken marker', () => {
  it('refuses a start marker without its end marker instead of adding a second block', () => {
    const dir = project({});
    writeFileSync(join(dir, 'AGENTS.md'), '<!-- a11y-checker:start -->\nhalf\n');

    expect(() => addAgentsBlock(dir)).toThrow(/without/);
  });
});

describe('init when the install fails', () => {
  const quietly = () => vi.spyOn(console, 'log').mockImplementation(() => {});

  it('throws and writes no AGENTS.md when the package manager cannot be run', async () => {
    quietly();
    installReturns({ error: new Error('spawn npm ENOENT'), status: null });
    const dir = project({});

    await expect(init(dir, true)).rejects.toThrow(/Could not run npm/);
    expect(existsSync(join(dir, 'AGENTS.md'))).toBe(false);
  });

  it('returns the package manager exit code and writes no AGENTS.md when it fails', async () => {
    quietly();
    installReturns({ status: 1 });
    const dir = project({});

    expect(await init(dir, true)).toBe(1);
    expect(existsSync(join(dir, 'AGENTS.md'))).toBe(false);
  });

  it('fails when the package manager is killed by a signal', async () => {
    quietly();
    installReturns({ status: null, signal: 'SIGKILL' });

    expect(await init(project({}), true)).toBe(1);
  });
});
