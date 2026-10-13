import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const bin = new URL('../dist/cli.js', import.meta.url).pathname;
const fixture = (name: string) => new URL(`./fixtures/${name}`, import.meta.url).pathname;
const cli = (...args: string[]) => spawnSync('node', [bin, ...args], { encoding: 'utf8' });

// Needs `npm run build` first (the `pretest` script does it). Argument and exit-code branching is
// covered in run.test.ts; this only proves the built binary is wired to the real scan.
describe('a11y-checker binary', () => {
  it('exits 1 and prints findings for a page with problems', () => {
    const { status, stdout } = cli(fixture('bad.html'));

    expect(status).toBe(1);
    expect(stdout).toContain('image-alt');
  });

  it('exits 0 for an accessible page', () => {
    expect(cli(fixture('good.html')).status).toBe(0);
  });

  it('exits 0 when --fail-on is above every finding', () => {
    expect(cli(fixture('moderate-only.html'), '--fail-on', 'serious').status).toBe(0);
  });

  it('install-skill copies the skill from the built package, and refuses to overwrite it', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'a11y-cli-'));
    const install = (...args: string[]) => spawnSync('node', [bin, 'install-skill', ...args], { encoding: 'utf8', cwd });

    expect(install().status).toBe(0);
    expect(existsSync(join(cwd, '.claude/skills/a11y-fix/SKILL.md'))).toBe(true);
    expect(existsSync(join(cwd, '.agents/skills/a11y-fix/SKILL.md'))).toBe(true);
    expect(install().status).toBe(2);
    expect(install('--force').status).toBe(0);
  });

  it('init prints the AGENTS.md block without writing it when it is not run in a terminal', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'a11y-init-'));
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ devDependencies: { 'a11y-checker': '3' } }));

    const { status, stdout } = spawnSync('node', [bin, 'init'], { encoding: 'utf8', cwd, stdio: ['ignore', 'pipe', 'pipe'] });

    expect(status).toBe(0);
    expect(stdout).toContain('npx a11y-checker --changed --json');
    expect(existsSync(join(cwd, 'AGENTS.md'))).toBe(false);
  });

  it('prints all of a large --json report through a pipe', () => {
    const dir = mkdtempSync(join(tmpdir(), 'a11y-big-'));
    writeFileSync(join(dir, 'Big.jsx'), `export const B = () => (\n<>\n${'<img src="a.png" />\n'.repeat(400)}</>\n);\n`);

    const { status, stdout } = spawnSync('node', [bin, dir, '--json'], { encoding: 'utf8', maxBuffer: 1 << 26 });

    expect(stdout.length).toBeGreaterThan(65536);
    expect(JSON.parse(stdout)).toHaveLength(400);
    expect(status).toBe(1);
  });

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
