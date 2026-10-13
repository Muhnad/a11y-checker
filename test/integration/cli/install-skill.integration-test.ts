import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bin } from '../../helpers.js';

describe('a11y-checker binary', () => {
  it('install-skill copies the skill from the built package, and refuses to overwrite it', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'a11y-cli-'));
    const install = (...args: string[]) => spawnSync('node', [bin, 'install-skill', ...args], { encoding: 'utf8', cwd });

    expect(install().status).toBe(0);
    expect(existsSync(join(cwd, '.claude/skills/a11y-fix/SKILL.md'))).toBe(true);
    expect(existsSync(join(cwd, '.agents/skills/a11y-fix/SKILL.md'))).toBe(true);
    expect(install().status).toBe(2);
    expect(install('--force').status).toBe(0);
  });
});
