#!/usr/bin/env node
import module from 'node:module';
import { parseArgs } from 'node:util';
import { run } from './run.js';
import { installSkill } from './skill.js';

// Caches compiled code on disk; the engines are imported lazily below, so this helps every later import.
module.enableCompileCache?.();

const args = process.argv.slice(2);

if (args[0] === 'mcp') {
  const [{ StdioServerTransport }, { createServer }] = await Promise.all([
    import('@modelcontextprotocol/sdk/server/stdio.js'),
    import('./mcp.js'),
  ]);
  await createServer().connect(new StdioServerTransport());
} else if (args[0] === 'init') {
  try {
    const { init } = await import('./init.js');
    process.exit(await init(args.find((a, i) => i > 0 && !a.startsWith('-')) ?? '.', args.includes('--yes')));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(2);
  }
} else if (args[0] === 'install-skill') {
  try {
    const { values } = parseArgs({ args: args.slice(1), options: { global: { type: 'boolean' }, force: { type: 'boolean' }, agent: { type: 'string' } } });
    for (const dest of installSkill(values)) console.log(`Installed the a11y-fix skill to ${dest}`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(2);
  }
} else {
  const { code, stdout, stderr } = await run(args);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  process.exit(code);
}
