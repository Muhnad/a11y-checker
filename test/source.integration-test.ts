import { describe, expect, it } from 'vitest';
import { scan } from '../src/index.js';
import { resolveTarget } from '../src/scan.js';

const fixture = (path: string) => new URL(`./fixtures/${path}`, import.meta.url).pathname;
const ruleIds = (findings: { ruleId: string }[]) => findings.map((f) => f.ruleId);

// Real ESLint + real plugins on fixture apps: stubbing the rule engine would make these meaningless.
describe('scan (source engine)', () => {
  it('reports web React problems with file and line', async () => {
    const findings = await scan(fixture('source/web'));

    const altText = findings.find((f) => f.ruleId === 'jsx-a11y/alt-text');
    expect(altText).toMatchObject({ engine: 'source', line: 4 });
    expect(altText?.file).toMatch(/source\/web\/Page\.tsx$/);
    expect(ruleIds(findings)).toContain('jsx-a11y/click-events-have-key-events');
  });

  it('reports React Native problems', async () => {
    const findings = await scan(fixture('source/native'));

    expect(ruleIds(findings)).toEqual(
      expect.arrayContaining([
        'react-native-a11y/has-valid-accessibility-descriptors',
        'react-native-a11y/has-valid-accessibility-role',
      ]),
    );
  });

  it('reports a Next.js root layout without a lang attribute', async () => {
    const findings = await scan(fixture('source/next'));

    const htmlLang = findings.find((f) => f.ruleId === 'jsx-a11y/html-has-lang');
    expect(htmlLang?.file).toMatch(/app\/layout\.tsx$/);
    expect(findings.every((f) => !f.file?.endsWith('page.tsx'))).toBe(true);
  });

  it('reports nothing for accessible components', async () => {
    expect(await scan(fixture('source/clean'))).toEqual([]);
  });

  it('scans a single source file', async () => {
    const findings = await scan(fixture('source/web/Page.tsx'));

    expect(ruleIds(findings)).toContain('jsx-a11y/alt-text');
  });
});

describe('resolveTarget', () => {
  it('sends a directory to the source engine', () => {
    expect(resolveTarget(fixture('source/web'))).toEqual({ source: fixture('source/web') });
  });

  it('sends a source file to the source engine', () => {
    expect(resolveTarget(fixture('source/web/Page.tsx'))).toEqual({ source: fixture('source/web/Page.tsx') });
  });

  it('sends an HTML file to the web engine', () => {
    expect(resolveTarget(fixture('good.html'))).toEqual({ url: `file://${fixture('good.html')}` });
  });
});
