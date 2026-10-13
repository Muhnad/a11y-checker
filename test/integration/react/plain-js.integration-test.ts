import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture } from '../../helpers.js';

describe('scan (plain JS)', () => {
  it('reports JSX in a .jsx file', async () => {
    const findings = await scan(fixture('react/plain-js'));

    expect(findings).toEqual([expect.objectContaining({ ruleId: 'jsx-a11y/alt-text', engine: 'source', line: 2 })]);
  });
});
