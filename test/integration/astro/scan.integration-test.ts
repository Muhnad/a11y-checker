import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture } from '../../helpers.js';

describe('scan (Astro)', () => {
  it('reports an Astro page once, through the astro rules only', async () => {
    const findings = await scan(fixture('astro'));

    expect(findings).toEqual([expect.objectContaining({ ruleId: 'astro/jsx-a11y/alt-text', engine: 'source', line: 7 })]);
    expect(findings[0]?.file).toMatch(/astro\/Page\.astro$/);
  });
});
