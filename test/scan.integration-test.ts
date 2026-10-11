import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { scan } from '../src/index.js';

const fixture = (name: string) => new URL(`./fixtures/${name}`, import.meta.url).pathname;

// Real Chromium + real axe-core: stubbing the audit engine would make these assertions meaningless.
describe('scan', () => {
  it('reports the problems on a page that has them', async () => {
    const findings = await scan(fixture('bad.html'));

    const ruleIds = findings.map((f) => f.ruleId);
    expect(ruleIds).toEqual(expect.arrayContaining(['document-title', 'html-has-lang', 'image-alt', 'button-name']));
  });

  it('locates each problem with a selector and the offending html', async () => {
    const findings = await scan(fixture('bad.html'));

    const imageAlt = findings.find((f) => f.ruleId === 'image-alt');
    expect(imageAlt).toMatchObject({ engine: 'web', impact: 'critical', selector: 'img', html: '<img src="photo.png">' });
  });

  it('reports nothing on an accessible page', async () => {
    expect(await scan(fixture('good.html'))).toEqual([]);
  });

  it('scans a raw HTML string', async () => {
    const findings = await scan(readFileSync(fixture('bad.html'), 'utf8'));

    expect(findings.map((f) => f.ruleId)).toContain('image-alt');
  });

  it('limits the audit to the requested axe tags', async () => {
    const findings = await scan(fixture('bad.html'), { tags: ['wcag111'] });

    expect(findings.map((f) => f.ruleId)).toEqual(['image-alt']);
  });

  it('rejects a target that is not a URL, an HTML file or HTML', async () => {
    await expect(scan('definitely-not-a-file')).rejects.toThrow('Unsupported target');
  });
});
