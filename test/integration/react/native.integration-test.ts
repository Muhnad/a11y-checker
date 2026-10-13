import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture, ruleIds } from '../../helpers.js';

describe('scan (source engine)', () => {
  it('reports React Native problems', async () => {
    const findings = await scan(fixture('react/native'));

    expect(ruleIds(findings)).toEqual(
      expect.arrayContaining([
        'react-native-a11y/has-valid-accessibility-descriptors',
        'react-native-a11y/has-valid-accessibility-role',
      ]),
    );
  });
});
