import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join } from 'node:path';
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

describe('scan (mixed codebase)', () => {
  it('checks React, Angular (file and inline template) and full HTML pages in one directory', async () => {
    const findings = await scan(fixture('mixed'));

    const hit = (ruleId: string, file: RegExp) => findings.some((f) => f.ruleId === ruleId && file.test(f.file ?? ''));
    expect(hit('jsx-a11y/alt-text', /Widget\.tsx$/)).toBe(true);
    expect(hit('@angular-eslint/template/alt-text', /card\.component\.html$/)).toBe(true);
    expect(hit('@angular-eslint/template/alt-text', /inline\.component\.ts$/)).toBe(true);
    expect(hit('image-alt', /page\.html$/)).toBe(true);
  });

  it('lints a full HTML page only through the browser, not as a template', async () => {
    const findings = await scan(fixture('mixed'));

    expect(findings.filter((f) => f.file?.endsWith('page.html')).map((f) => f.engine)).toEqual(['web']);
  });

  it('scans only the files it is given', async () => {
    const findings = await scan([fixture('mixed/Widget.tsx'), fixture('mixed/page.html')]);

    expect(findings.map((f) => f.file?.split('/').pop()).sort()).toEqual(['Widget.tsx', 'page.html']);
  });
});

describe('scan (Vue)', () => {
  it('reports a Vue single-file component, including one with <script lang="ts">', async () => {
    const findings = await scan(fixture('vue'));

    expect(findings).toEqual([
      expect.objectContaining({ ruleId: 'vuejs-accessibility/alt-text', engine: 'source', line: 6 }),
    ]);
    expect(findings[0]?.file).toMatch(/vue\/App\.vue$/);
  });
});

describe('scan (Astro)', () => {
  it('reports an Astro page once, through the astro rules only', async () => {
    const findings = await scan(fixture('astro'));

    expect(findings).toEqual([expect.objectContaining({ ruleId: 'astro/jsx-a11y/alt-text', engine: 'source', line: 7 })]);
    expect(findings[0]?.file).toMatch(/astro\/Page\.astro$/);
  });
});

describe('scan (plain JS and HTML)', () => {
  it('reports JSX in a .jsx file', async () => {
    const findings = await scan(fixture('js'));

    expect(findings).toEqual([expect.objectContaining({ ruleId: 'jsx-a11y/alt-text', engine: 'source', line: 2 })]);
  });

  it('reports a single Angular template file', async () => {
    const findings = await scan(fixture('mixed/card.component.html'));

    expect(findings).toEqual([expect.objectContaining({ ruleId: '@angular-eslint/template/alt-text', engine: 'source' })]);
  });

  it('reports a plain HTML page through the browser', async () => {
    const findings = await scan(fixture('bad.html'));

    expect(findings.map((f) => f.engine)).toContain('web');
    expect(ruleIds(findings)).toContain('image-alt');
  });
});

describe('scan (accessible code in every supported kind)', () => {
  it('reports nothing and warns about nothing for React, Vue, Astro, Angular and HTML', async () => {
    const warnings: string[] = [];
    const findings = await scan(fixture('accessible'), { onWarning: (w) => warnings.push(w) });

    expect(findings).toEqual([]);
    expect(warnings).toEqual([]);
  });
});

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
    const findings = await scan(fixture('real-world'));

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

describe('scan warnings', () => {
  const warningsFor = async (path: string) => {
    const warnings: string[] = [];
    const findings = await scan(fixture(path), { onWarning: (w) => warnings.push(w) });
    return { findings, warnings };
  };

  it('says which files were skipped instead of looking clean', async () => {
    const { findings, warnings } = await warningsFor('unlinted');

    expect(findings).toEqual([]);
    expect(warnings).toEqual([expect.stringContaining('1 .svelte')]);
  });

  it('warns for a single unsupported file and reports no fake finding', async () => {
    const { findings, warnings } = await warningsFor('unlinted/App.svelte');

    expect(findings).toEqual([]);
    expect(warnings).toEqual([expect.stringContaining('.svelte')]);
  });

  it('warns when a directory has nothing to scan', async () => {
    const { warnings } = await warningsFor('empty');

    expect(warnings).toEqual([expect.stringContaining('No files with source rules')]);
  });

  it('does not warn when everything was scanned', async () => {
    expect((await warningsFor('source/clean')).warnings).toEqual([]);
    expect((await warningsFor('mixed')).warnings).toEqual([]);
  });
});

describe('resolveTarget', () => {
  it('sends an HTML fragment to the source engine', () => {
    expect(resolveTarget(fixture('mixed/card.component.html'))).toEqual({ source: fixture('mixed/card.component.html') });
  });

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
