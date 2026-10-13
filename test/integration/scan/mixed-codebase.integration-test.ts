import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture } from '../../helpers.js';

describe('scan (mixed codebase)', () => {
  it('checks React, Angular (file and inline template) and full HTML pages in one directory', async () => {
    const findings = await scan(fixture('scan/mixed'));

    const hit = (ruleId: string, file: RegExp) => findings.some((f) => f.ruleId === ruleId && file.test(f.file ?? ''));
    expect(hit('jsx-a11y/alt-text', /Widget\.tsx$/)).toBe(true);
    expect(hit('@angular-eslint/template/alt-text', /card\.component\.html$/)).toBe(true);
    expect(hit('@angular-eslint/template/alt-text', /inline\.component\.ts$/)).toBe(true);
    expect(hit('image-alt', /page\.html$/)).toBe(true);
  });

  it('lints a full HTML page only through the browser, not as a template', async () => {
    const findings = await scan(fixture('scan/mixed'));

    expect(findings.filter((f) => f.file?.endsWith('page.html')).map((f) => f.engine)).toEqual(['web']);
  });

  it('scans only the files it is given', async () => {
    const findings = await scan([fixture('scan/mixed/Widget.tsx'), fixture('scan/mixed/page.html')]);

    expect(findings.map((f) => f.file?.split('/').pop()).sort()).toEqual(['Widget.tsx', 'page.html']);
  });
});

describe('scan (accessible code in every supported kind)', () => {
  it('reports nothing and warns about nothing for React, Vue, Astro, Angular and HTML', async () => {
    const warnings: string[] = [];
    const findings = await scan(fixture('scan/accessible'), { onWarning: (w) => warnings.push(w) });

    expect(findings).toEqual([]);
    expect(warnings).toEqual([]);
  });
});
