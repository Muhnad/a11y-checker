#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './mcp.js';
import { run } from './run.js';

const args = process.argv.slice(2);

if (args[0] === 'mcp') {
  await createServer().connect(new StdioServerTransport());
} else {
  const { code, stdout, stderr } = await run(args);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  process.exit(code);
}
