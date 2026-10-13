import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { installSkill } from '../../src/commands/install-skill.js';

describe('installSkill', () => {
  let cwd: string;
  let home: string;
  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'a11y-cwd-'));
    home = mkdtempSync(join(tmpdir(), 'a11y-home-'));
  });

  it('copies the skill into .agents/skills and .claude/skills of the project', () => {
    const dests = installSkill({ cwd, home });

    expect(dests).toEqual([join(cwd, '.agents/skills/a11y-fix'), join(cwd, '.claude/skills/a11y-fix')]);
    for (const dest of dests) expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toContain('name: a11y-fix');
  });

  it('installs into the home directory with global', () => {
    expect(installSkill({ global: true, cwd, home })).toEqual([
      join(home, '.agents/skills/a11y-fix'),
      join(home, '.claude/skills/a11y-fix'),
    ]);
  });

  it('installs for one agent only', () => {
    expect(installSkill({ cwd, home, agent: 'claude' })).toEqual([join(cwd, '.claude/skills/a11y-fix')]);
    expect(existsSync(join(cwd, '.agents'))).toBe(false);
  });

  it('rejects an unknown agent', () => {
    expect(() => installSkill({ cwd, home, agent: 'vim' })).toThrow(/Unknown --agent "vim"/);
  });

  it('refuses to overwrite an existing install', () => {
    installSkill({ cwd, home });

    expect(() => installSkill({ cwd, home })).toThrow(/already exists.*--force/);
  });

  it('overwrites an existing install with force', () => {
    const [dest] = installSkill({ cwd, home });
    writeFileSync(join(dest!, 'SKILL.md'), 'edited');

    installSkill({ cwd, home, force: true });

    expect(readFileSync(join(dest!, 'SKILL.md'), 'utf8')).toContain('name: a11y-fix');
  });
});
