import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture } from '../../helpers.js';

describe('scan (source engine)', () => {
  it('reports a Next.js root layout without a lang attribute', async () => {
    const findings = await scan(fixture('react/next'));

    const htmlLang = findings.find((f) => f.ruleId === 'jsx-a11y/html-has-lang');
    expect(htmlLang?.file).toMatch(/app\/layout\.tsx$/);
    expect(findings.every((f) => !f.file?.endsWith('page.tsx'))).toBe(true);
  });
});
