import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bin } from '../../helpers.js';

describe('a11y-checker binary', () => {
  describe('--changed', () => {
    const repo = () => {
      const cwd = mkdtempSync(join(tmpdir(), 'a11y-changed-'));
      const git = (...args: string[]) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd });
      const bad = '<img src="a.png" />';
      const jsx = (body: string) => `export const C = () => ${body};\n`;
      git('init', '-q');
      writeFileSync(join(cwd, 'Old.jsx'), jsx(bad));
      writeFileSync(join(cwd, 'Edited.jsx'), jsx('<p>ok</p>'));
      git('add', '.');
      git('commit', '-qm', 'base');
      return { cwd, jsx, bad };
    };
    const changed = (cwd: string) => spawnSync('node', [bin, '--changed'], { encoding: 'utf8', cwd });

    it('scans edited and new files but not unchanged ones', () => {
      const { cwd, jsx, bad } = repo();
      writeFileSync(join(cwd, 'Edited.jsx'), jsx(bad));
      writeFileSync(join(cwd, 'New.jsx'), jsx(bad));

      const { status, stdout } = changed(cwd);

      expect(status).toBe(1);
      expect(stdout).toContain('Edited.jsx');
      expect(stdout).toContain('New.jsx');
      expect(stdout).not.toContain('Old.jsx');
    });

    it('scans files whose names have spaces or accents', () => {
      const { cwd, jsx, bad } = repo();
      writeFileSync(join(cwd, 'Café menü.jsx'), jsx(bad));
      writeFileSync(join(cwd, 'my page.jsx'), jsx(bad));

      const { status, stdout } = changed(cwd);

      expect(status).toBe(1);
      expect(stdout).toContain('Café menü.jsx');
      expect(stdout).toContain('my page.jsx');
    });

    it('prints an empty JSON array with --json when nothing changed', () => {
      const { status, stdout } = spawnSync('node', [bin, '--changed', '--json'], { encoding: 'utf8', cwd: repo().cwd });

      expect(status).toBe(0);
      expect(JSON.parse(stdout)).toEqual([]);
    });

    it('exits 0 when nothing changed', () => {
      const { status, stdout } = changed(repo().cwd);

      expect(status).toBe(0);
      expect(stdout).toContain('No accessibility issues found.');
    });
  });
});
