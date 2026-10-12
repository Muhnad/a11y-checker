import { cpSync, existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Resolves from src/ in tests and from dist/ once built: both sit next to skills/ at the package root.
const SKILL_DIR = new URL('../skills/a11y-fix/', import.meta.url);

/** The skill's workflow without its frontmatter, so MCP clients without skill support can use it as a prompt. */
export function skillWorkflow(): string {
  return readFileSync(new URL('SKILL.md', SKILL_DIR), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

// `.agents/skills` is the cross-client location of the Agent Skills standard (Codex, Gemini CLI, Cursor, ...); Claude Code reads `.claude/skills`.
const SKILL_ROOTS = { agents: '.agents', claude: '.claude' };
export type SkillAgent = 'all' | keyof typeof SKILL_ROOTS;

/** Copy the packaged skill into `skills/a11y-fix` under each agent directory of cwd, or of the home directory with `global`. Returns the destinations. */
export function installSkill({ global = false, force = false, agent = 'all', cwd = process.cwd(), home = homedir() }: {
  global?: boolean;
  force?: boolean;
  agent?: string;
  cwd?: string;
  home?: string;
} = {}): string[] {
  const roots = agent === 'all' ? Object.values(SKILL_ROOTS) : [SKILL_ROOTS[agent as keyof typeof SKILL_ROOTS]];
  if (roots.some((r) => r === undefined)) throw new Error(`Unknown --agent "${agent}". Use all, agents or claude.`);
  const dests = roots.map((root) => join(global ? home : cwd, root, 'skills', 'a11y-fix'));
  const taken = dests.find((d) => existsSync(d));
  if (taken && !force) throw new Error(`${taken} already exists. Use --force to overwrite it.`);
  for (const dest of dests) cpSync(SKILL_DIR, dest, { recursive: true });
  return dests;
}
