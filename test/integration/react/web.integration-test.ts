import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture, ruleIds } from '../../helpers.js';

// Real ESLint + real plugins on fixture apps: stubbing the rule engine would make these meaningless.
describe('scan (source engine)', () => {
  it('reports web React problems with file and line', async () => {
    const findings = await scan(fixture('react/web'));

    const altText = findings.find((f) => f.ruleId === 'jsx-a11y/alt-text');
    expect(altText).toMatchObject({ engine: 'source', line: 4 });
    expect(altText?.file).toMatch(/react\/web\/Page\.tsx$/);
    expect(ruleIds(findings)).toContain('jsx-a11y/click-events-have-key-events');
  });

  it('reports nothing for accessible components', async () => {
    expect(await scan(fixture('react/clean'))).toEqual([]);
  });

  it('scans a single source file', async () => {
    const findings = await scan(fixture('react/web/Page.tsx'));

    expect(ruleIds(findings)).toContain('jsx-a11y/alt-text');
  });
});
