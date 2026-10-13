#!/usr/bin/env node
import module from 'node:module';
import { parseArgs } from 'node:util';
import { run } from './commands/run.js';
import { installSkill } from './commands/install-skill.js';

// Caches compiled code on disk; the engines are imported lazily, so this helps every later import.
module.enableCompileCache?.();

type Command = (args: string[]) => Promise<number | void> | number | void;

async function startMcpServer(): Promise<void> {
  const [{ StdioServerTransport }, { createServer }] = await Promise.all([
    import('@modelcontextprotocol/sdk/server/stdio.js'),
    import('./mcp/server.js'),
  ]);
  await createServer().connect(new StdioServerTransport());
}

async function initProject(args: string[]): Promise<number> {
  const { init } = await import('./commands/init.js');
  return init(args.find((a) => !a.startsWith('-')) ?? '.', args.includes('--yes'));
}

function installSkillFiles(args: string[]): number {
  const { values } = parseArgs({ args, options: { global: { type: 'boolean' }, force: { type: 'boolean' }, agent: { type: 'string' } } });
  for (const destination of installSkill(values)) console.log(`Installed the a11y-fix skill to ${destination}`);
  return 0;
}

const writeAndFlush = (stream: NodeJS.WriteStream, text: string) => new Promise((done) => stream.write(`${text}\n`, done));

async function scanTargets(args: string[]): Promise<number> {
  const { code, stdout, stderr } = await run(args);
  // process.exit() would cut off output still queued on a pipe (it truncates at 64 KiB), so wait for each write.
  if (stdout) await writeAndFlush(process.stdout, stdout);
  if (stderr) await writeAndFlush(process.stderr, stderr);
  return code;
}

const COMMANDS: Record<string, Command> = { mcp: startMcpServer, init: initProject, 'install-skill': installSkillFiles };

const [name = '', ...rest] = process.argv.slice(2);
try {
  const exitCode = Object.hasOwn(COMMANDS, name) ? await COMMANDS[name]!(rest) : await scanTargets([name, ...rest].filter(Boolean));
  // The MCP server returns nothing: it keeps running until the client disconnects.
  if (exitCode !== undefined) process.exit(exitCode);
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(2);
}
