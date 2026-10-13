import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// Runs `npm pack --dry-run`: the skill and the built CLI must be in the tarball, tests and sources must not.
describe('npm package', () => {
  it('ships the skill and dist but not sources or tests', () => {
    const [pack] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })) as {
      files: { path: string }[];
    }[];
    const paths = pack!.files.map((f) => f.path);

    expect(paths).toEqual(expect.arrayContaining(['skills/a11y-fix/SKILL.md', 'dist/cli.js', 'README.md']));
    expect(paths.filter((p) => /^(src|test)\//.test(p))).toEqual([]);
  });
});
