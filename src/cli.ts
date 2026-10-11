#!/usr/bin/env node
import { run } from './run.js';

const { code, stdout, stderr } = await run(process.argv.slice(2));
if (stdout) console.log(stdout);
if (stderr) console.error(stderr);
process.exit(code);
