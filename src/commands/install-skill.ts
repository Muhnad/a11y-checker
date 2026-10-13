import { cpSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { SKILL_DIR } from '../skill.js';

// `.agents/skills` is the cross-client location of the Agent Skills standard (Codex, Gemini CLI, Cursor, ...); Claude Code reads `.claude/skills`.
const SKILL_ROOTS = { agents: '.agents', claude: '.claude' };

function rootsFor(agent: string): string[] {
  if (agent === 'all') return Object.values(SKILL_ROOTS);
  if (!Object.hasOwn(SKILL_ROOTS, agent)) throw new Error(`Unknown --agent "${agent}". Use all, agents or claude.`);
  return [SKILL_ROOTS[agent as keyof typeof SKILL_ROOTS]];
}

interface InstallOptions {
  global?: boolean;
  force?: boolean;
  agent?: string;
  cwd?: string;
  home?: string;
}

/** Copy the packaged skill into `skills/a11y-fix` under each agent directory of cwd, or of the home directory with `global`. Returns the destinations. */
export function installSkill({ global = false, force = false, agent = 'all', cwd = process.cwd(), home = homedir() }: InstallOptions = {}): string[] {
  const base = global ? home : cwd;
  const destinations = rootsFor(agent).map((root) => join(base, root, 'skills', 'a11y-fix'));
  const taken = destinations.find((destination) => existsSync(destination));
  if (taken && !force) throw new Error(`${taken} already exists. Use --force to overwrite it.`);

  for (const destination of destinations) cpSync(SKILL_DIR, destination, { recursive: true });
  return destinations;
}
