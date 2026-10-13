import { describe, expect, it } from 'vitest';
import { skillWorkflow } from '../../src/skill.js';

describe('skillWorkflow', () => {
  it('returns the skill body without its frontmatter', () => {
    const text = skillWorkflow();

    expect(text.startsWith('# a11y-fix')).toBe(true);
    expect(text).not.toContain('description:');
  });
});
