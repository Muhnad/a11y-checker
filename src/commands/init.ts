import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { readManifest } from '../manifest.js';

const LOCKFILES: [string, string[]][] = [
  ['pnpm-lock.yaml', ['pnpm', 'add', '-D']],
  ['yarn.lock', ['yarn', 'add', '-D']],
  ['bun.lock', ['bun', 'add', '-D']],
  ['bun.lockb', ['bun', 'add', '-D']],
];

const packageManagerFor = (dir: string): string[] =>
  LOCKFILES.find(([lockfile]) => existsSync(join(dir, lockfile)))?.[1] ?? ['npm', 'install', '-D'];

const withPeerRange = (name: string) => (name === 'a11y-checker' ? name : `${name}@${readManifest().peerDependencies[name]}`);

/** What `init` would install for the project in `dir`, and notes for what it cannot help with. */
export function plan(dir: string): { argv: string[]; notes: string[] } {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Record<string, Record<string, string> | undefined>;
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const wanted = ['a11y-checker', ...('astro' in deps ? ['eslint-plugin-astro'] : [])];
  const missing = wanted.filter((name) => !(name in deps)).map(withPeerRange);
  const notes = 'svelte' in deps ? ['Svelte has no source rules: scan the running app with `npx a11y-checker <url>`.'] : [];
  return { argv: missing.length ? [...packageManagerFor(dir), ...missing] : [], notes };
}

const START = '<!-- a11y-checker:start -->';
const END = '<!-- a11y-checker:end -->';
const BLOCK = `${START}
## Accessibility (a11y-checker)

After changing UI code, run \`npx a11y-checker --changed --json\` (or pass the files or directories you changed, or the running app's URL) and fix every finding until it exits 0.
Each finding has \`file\` and \`line\` or a \`selector\`, and a \`fixHint\`. \`Warning:\` lines on stderr name files that were skipped.
Automated checks find only part of the problems: say what still needs a keyboard and screen reader pass.
${END}
`;

const separatorBefore = (text: string) => {
  if (!text || text.endsWith('\n\n')) return '';
  return text.endsWith('\n') ? '\n' : '\n\n';
};

/** `text` with the a11y block appended, or replacing the block an earlier run added. */
export function withAgentsBlock(text: string): string {
  const [start, end] = [text.indexOf(START), text.indexOf(END)];
  if (start >= 0 && end < start) throw new Error(`AGENTS.md has "${START}" without "${END}": fix or remove it, then run init again.`);
  if (start >= 0) return text.slice(0, start) + BLOCK.trimEnd() + text.slice(end + END.length);
  return text + separatorBefore(text) + BLOCK;
}

/** Write the a11y instructions into the `AGENTS.md` of `dir`, the file most coding agents read. Returns the file. */
export function addAgentsBlock(dir: string): string {
  const file = join(dir, 'AGENTS.md');
  writeFileSync(file, withAgentsBlock(existsSync(file) ? readFileSync(file, 'utf8') : ''));
  return file;
}

async function approve(question: string, yes: boolean): Promise<boolean> {
  if (yes) return true;
  if (!process.stdin.isTTY) return false; // not interactive: only print what would be done
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();
  return /^y/i.test(answer);
}

/** Runs the install and returns its exit code. */
function install(argv: string[], dir: string): number {
  // shell on Windows, where the package managers are .cmd shims.
  const { status, error } = spawnSync(argv[0]!, argv.slice(1), { cwd: dir, stdio: 'inherit', shell: process.platform === 'win32' });
  if (error) throw new Error(`Could not run ${argv[0]}: ${error.message}`);
  return status ?? 1; // null: killed by a signal
}

async function offerAgentsBlock(dir: string, yes: boolean): Promise<void> {
  if (await approve('Add a11y-checker instructions to AGENTS.md (read by most coding agents)?', yes)) {
    console.log(`Updated ${addAgentsBlock(dir)}`);
  } else if (!process.stdin.isTTY) {
    console.log(`Add this to AGENTS.md:\n\n${BLOCK}`);
  }
}

/** Install a11y-checker (and the optional plugin the project needs) locally, so `npx a11y-checker` sees the plugins, and tell the project's agents how to use it. */
export async function init(dir: string, yes: boolean): Promise<number> {
  const { argv, notes } = plan(dir);
  notes.forEach((note) => console.log(note));

  if (!argv.length) {
    console.log('Nothing to install: a11y-checker and the plugins this project needs are already in package.json.');
  } else {
    console.log(`Install: ${argv.join(' ')}`);
    const status = (await approve('Run it?', yes)) ? install(argv, dir) : 0;
    if (status !== 0) return status;
  }
  await offerAgentsBlock(dir, yes);
  console.log('Add to CI: npx a11y-checker src --fail-on serious');
  return 0;
}
