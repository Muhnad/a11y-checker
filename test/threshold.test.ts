import { describe, expect, it } from 'vitest';
import { exceedsThreshold, type Finding, type Impact } from '../src/index.js';

const finding = (impact: Impact): Finding => ({
  engine: 'web',
  ruleId: 'image-alt',
  impact,
  wcag: ['wcag111'],
  message: 'Images must have alternate text',
  helpUrl: 'https://dequeuniversity.com/rules/axe/4.14/image-alt',
  fixHint: 'Add an alt attribute.',
});

describe('exceedsThreshold', () => {
  it('is false when there are no findings', () => {
    expect(exceedsThreshold([], 'minor')).toBe(false);
  });

  it('is false when every finding is below the threshold', () => {
    expect(exceedsThreshold([finding('minor'), finding('moderate')], 'serious')).toBe(false);
  });

  it('is true when a finding is exactly at the threshold', () => {
    expect(exceedsThreshold([finding('serious')], 'serious')).toBe(true);
  });

  it('is true when a finding is above the threshold', () => {
    expect(exceedsThreshold([finding('minor'), finding('critical')], 'serious')).toBe(true);
  });
});
