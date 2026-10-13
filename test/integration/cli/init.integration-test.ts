import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bin } from '../../helpers.js';

describe('a11y-checker binary', () => {
  it('init prints the AGENTS.md block without writing it when it is not run in a terminal', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'a11y-init-'));
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ devDependencies: { 'a11y-checker': '3' } }));

    const { status, stdout } = spawnSync('node', [bin, 'init'], { encoding: 'utf8', cwd, stdio: ['ignore', 'pipe', 'pipe'] });

    expect(status).toBe(0);
    expect(stdout).toContain('npx a11y-checker --changed --json');
    expect(existsSync(join(cwd, 'AGENTS.md'))).toBe(false);
  });
});
