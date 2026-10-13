import type { Result } from 'axe-core';
import { describe, expect, it } from 'vitest';
import { toFindings } from '../../src/engines/web-findings.js';

const violation = (overrides: Partial<Result> = {}): Result =>
  ({
    id: 'image-alt',
    impact: 'critical',
    tags: ['cat.text-alternatives', 'wcag2a', 'wcag111'],
    description: 'Ensure <img> elements have alternate text',
    help: 'Images must have alternate text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.14/image-alt',
    nodes: [{ html: '<img src="a.png">', target: ['img'] }],
    ...overrides,
  }) as Result;

describe('toFindings', () => {
  it('returns no findings when there are no violations', () => {
    expect(toFindings([])).toEqual([]);
  });

  it('returns one finding per offending element', () => {
    const nodes = [
      { html: '<img src="a.png">', target: ['#a'] },
      { html: '<img src="b.png">', target: ['#b'] },
    ] as Result['nodes'];

    const findings = toFindings([violation({ nodes })]);

    expect(findings.map((f) => f.selector)).toEqual(['#a', '#b']);
    expect(findings.map((f) => f.html)).toEqual(['<img src="a.png">', '<img src="b.png">']);
  });

  it('maps rule metadata onto the finding', () => {
    const [finding] = toFindings([violation()]);

    expect(finding).toMatchObject({
      engine: 'web',
      ruleId: 'image-alt',
      impact: 'critical',
      message: 'Images must have alternate text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.14/image-alt',
    });
  });

  it('keeps only the wcag tags', () => {
    const [finding] = toFindings([violation()]);

    expect(finding?.wcag).toEqual(['wcag2a', 'wcag111']);
  });

  it('uses a specific fix hint for a known rule', () => {
    const [finding] = toFindings([violation({ id: 'image-alt' })]);

    expect(finding?.fixHint).toContain('alt=');
  });

  it('falls back to the rule help text for an unknown rule', () => {
    const [finding] = toFindings([violation({ id: 'some-new-rule', help: 'Do the new thing' })]);

    expect(finding?.fixHint).toBe('Do the new thing');
  });

  it('treats a missing impact as minor', () => {
    const [finding] = toFindings([violation({ impact: null })]);

    expect(finding?.impact).toBe('minor');
  });
});
