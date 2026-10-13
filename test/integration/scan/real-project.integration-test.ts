import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture, ruleIds } from '../../helpers.js';

describe('scan (repeat scans)', () => {
  it('reports an edited file afresh instead of replaying a cached result', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'a11y-cache-'));
    const file = join(dir, 'Page.jsx');
    writeFileSync(file, 'export const P = () => <img src="a.png" />;\n');
    expect(ruleIds(await scan(dir))).toEqual(['jsx-a11y/alt-text']);

    writeFileSync(file, 'export const P = () => <img src="a.png" alt="A lake" />;\n');

    expect(await scan(dir)).toEqual([]);
  });
});

describe('scan (noise a real project would show)', () => {
  it('reports only the unlabelled button: no hint rule, no unknown-rule errors, no test or mock files', async () => {
    const findings = await scan(fixture('scan/real-world'));

    expect(findings).toEqual([
      expect.objectContaining({ ruleId: 'react-native-a11y/has-valid-accessibility-descriptors', line: 11 }),
    ]);
    expect(findings[0]?.file).toMatch(/real-world\/Menu\.tsx$/);
  });

  it('does not turn a stale eslint-disable comment into a finding', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'a11y-stale-'));
    writeFileSync(join(dir, 'P.jsx'), '// eslint-disable-next-line no-console\nexport const P = () => <img src="a.png" />;\n');

    expect(ruleIds(await scan(dir))).toEqual(['jsx-a11y/alt-text']);
  });

  it('still reports a file that does not parse', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'a11y-parse-'));
    writeFileSync(join(dir, 'P.jsx'), 'export const P = () => <p>;\n');

    expect(ruleIds(await scan(dir))).toEqual(['parse-error']);
  });

  it('prints an absolute path for a file outside the working directory', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'a11y-abs-'));
    writeFileSync(join(dir, 'Page.jsx'), 'export const P = () => <img src="a.png" />;\n');

    const [finding] = await scan(dir);

    expect(isAbsolute(finding!.file!)).toBe(true);
  });
});
