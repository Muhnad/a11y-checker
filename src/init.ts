import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';

const LOCKFILES: [string, string[]][] = [
  ['pnpm-lock.yaml', ['pnpm', 'add', '-D']],
  ['yarn.lock', ['yarn', 'add', '-D']],
  ['bun.lock', ['bun', 'add', '-D']],
  ['bun.lockb', ['bun', 'add', '-D']],
];

// Read at run time: package.json sits next to dist/ and src/ alike.
const peerRange = (name: string): string =>
  (JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).peerDependencies as Record<string, string>)[name]!;

/** What `init` would install for the project in `dir`, and notes for what it cannot help with. */
export function plan(dir: string): { argv: string[]; notes: string[] } {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Record<string, Record<string, string> | undefined>;
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const add = ['a11y-checker', ...('astro' in deps ? ['eslint-plugin-astro'] : [])]
    .filter((name) => !(name in deps))
    .map((name) => (name === 'a11y-checker' ? name : `${name}@${peerRange(name)}`));
  const [, pm = ['npm', 'install', '-D']] = LOCKFILES.find(([file]) => existsSync(join(dir, file))) ?? [];
  const notes = 'svelte' in deps ? ['Svelte has no source rules: scan the running app with `npx a11y-checker <url>`.'] : [];
  return { argv: add.length ? [...pm, ...add] : [], notes };
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

/** Write the a11y instructions into `AGENTS.md` of `dir` (the file most coding agents read), replacing an earlier copy. Returns the file. */
export function addAgentsBlock(dir: string): string {
  const file = join(dir, 'AGENTS.md');
  const text = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const [from, to] = [text.indexOf(START), text.indexOf(END)];
  if (from >= 0 && to < from) throw new Error(`${file} has "${START}" without "${END}": fix or remove it, then run init again.`);
  const gap = !text || text.endsWith('\n\n') ? '' : text.endsWith('\n') ? '\n' : '\n\n';
  const next = from >= 0 && to > from ? text.slice(0, from) + BLOCK.trimEnd() + text.slice(to + END.length) : text + gap + BLOCK;
  writeFileSync(file, next);
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

/** Install a11y-checker (and the optional plugin the project needs) locally, so `npx a11y-checker` sees the plugins, and tell the project's agents how to use it. */
export async function init(dir: string, yes: boolean): Promise<number> {
  const { argv, notes } = plan(dir);
  for (const note of notes) console.log(note);
  if (!argv.length) {
    console.log('Nothing to install: a11y-checker and the plugins this project needs are already in package.json.');
  } else {
    console.log(`Install: ${argv.join(' ')}`);
    if (await approve('Run it?', yes)) {
      // shell on Windows, where the package managers are .cmd shims.
      const { status, error } = spawnSync(argv[0]!, argv.slice(1), { cwd: dir, stdio: 'inherit', shell: process.platform === 'win32' });
      if (error) throw new Error(`Could not run ${argv[0]}: ${error.message}`);
      if (status !== 0) return status ?? 1; // null: killed by a signal
    }
  }
  if (await approve('Add a11y-checker instructions to AGENTS.md (read by most coding agents)?', yes)) {
    console.log(`Updated ${addAgentsBlock(dir)}`);
  } else if (!process.stdin.isTTY) {
    console.log(`Add this to AGENTS.md:\n\n${BLOCK}`);
  }
  console.log('Add to CI: npx a11y-checker src --fail-on serious');
  return 0;
}
