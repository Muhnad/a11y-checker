import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture } from '../../helpers.js';

describe('scan (Vue)', () => {
  it('reports a Vue single-file component, including one with <script lang="ts">', async () => {
    const findings = await scan(fixture('vue'));

    expect(findings).toEqual([
      expect.objectContaining({ ruleId: 'vuejs-accessibility/alt-text', engine: 'source', line: 6 }),
    ]);
    expect(findings[0]?.file).toMatch(/vue\/App\.vue$/);
  });
});
