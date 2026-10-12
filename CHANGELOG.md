# Changelog

## 3.0.0

Rewrite. Breaking: the v2 `a11yChecker()` browser API and its hand-written rules are gone (kept on the `v2` branch).

### Added
- `web` engine: Playwright + axe-core on the rendered page.
- `source` engine: ESLint with `eslint-plugin-jsx-a11y`, `eslint-plugin-react-native-a11y` and `eslint-plugin-vuejs-accessibility`, `eslint-plugin-astro` (optional peer, install it to lint `.astro` files) and `@angular-eslint` template rules, for React, Next.js, React Native, Vue, Astro and Angular code (including inline templates). Full HTML pages in a directory are rendered and checked with axe.
- Source scans warn about files they skipped (e.g. `.svelte`) or when nothing was scannable, instead of reporting a clean result (CLI stderr, MCP extra block, `onWarning`).
- `--changed` scans only files changed since `HEAD` plus new files.
- `init` installs `a11y-checker` and the optional plugin the project needs, with the project's package manager.
- Scan several files or directories at once (CLI arguments, `scan([...])`, MCP `target` list).
- One `Finding` schema across engines, with a `fixHint` per finding.
- CLI with `--json`, `--fail-on`, `--tags`, `--wait-for`, and exit codes for CI.
- `scan()` and `exceedsThreshold()` library API (ESM and CJS, with types).
- MCP server (`a11y-checker mcp`) with `scan_page`, `explain_rule` and an `a11y-fix` prompt that carries the skill's workflow.
- `a11y-fix` agent skill, shipped in the npm package, and a Claude Code plugin with marketplace manifest (`/plugin marketplace add Muhnad/a11y-checker`).
- `a11y-checker install-skill [--global] [--force] [--agent all|agents|claude]` copies the skill into `.agents/skills` (the Agent Skills standard, read by Codex, Gemini CLI, Cursor and others) and `.claude/skills`, or into the same folders under `~`.
- `init` offers to add an a11y block to the project's `AGENTS.md`, so any coding agent knows to scan after UI changes.
- Tests and CI (lint, typecheck, unit and integration).

### Changed
- Faster start: engines and framework plugins are imported only when a scan needs them (`--help` ~600 ms to ~20 ms, a one-file React scan ~625 ms to ~190 ms), compiled code is cached, and ESLint results are cached between runs.
- `typescript` is no longer a dependency; a project's own TypeScript is used (saves a second 24 MB copy).
- Requires Node 22+. Web scans need `npx playwright install chromium`.

## 2.2.1

Last release of the v2 line.
