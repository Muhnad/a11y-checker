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
});
