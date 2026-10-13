import { readFileSync } from 'node:fs';

// Resolves from src/ in tests and from dist/ once built: both sit next to skills/ at the package root.
export const SKILL_DIR = new URL('../skills/a11y-fix/', import.meta.url);

/** The skill's workflow without its frontmatter, so MCP clients without skill support can use it as a prompt. */
export const skillWorkflow = (): string =>
  readFileSync(new URL('SKILL.md', SKILL_DIR), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '').trim();
