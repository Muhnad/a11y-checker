import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bin } from '../../helpers.js';

describe('a11y-checker binary', () => {
  it('prints all of a large --json report through a pipe', () => {
    const dir = mkdtempSync(join(tmpdir(), 'a11y-big-'));
    writeFileSync(join(dir, 'Big.jsx'), `export const B = () => (\n<>\n${'<img src="a.png" />\n'.repeat(400)}</>\n);\n`);

    const { status, stdout } = spawnSync('node', [bin, dir, '--json'], { encoding: 'utf8', maxBuffer: 1 << 26 });

    expect(stdout.length).toBeGreaterThan(65536);
    expect(JSON.parse(stdout)).toHaveLength(400);
    expect(status).toBe(1);
  });
});
