import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture } from '../../helpers.js';

describe('scan (Angular)', () => {
  it('reports a single Angular template file', async () => {
    const findings = await scan(fixture('angular/card.component.html'));

    expect(findings).toEqual([expect.objectContaining({ ruleId: '@angular-eslint/template/alt-text', engine: 'source' })]);
  });
});
