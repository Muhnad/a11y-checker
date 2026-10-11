# Changelog

## 3.0.0

Rewrite. Breaking: the v2 `a11yChecker()` browser API and its hand-written rules are gone (kept on the `v2` branch).

### Added
- `web` engine: Playwright + axe-core on the rendered page.
- `source` engine: ESLint with `eslint-plugin-jsx-a11y`, `eslint-plugin-react-native-a11y` and `eslint-plugin-vuejs-accessibility`, `eslint-plugin-astro` (optional peer, install it to lint `.astro` files) and `@angular-eslint` template rules, for React, Next.js, React Native, Vue, Astro and Angular code (including inline templates). Full HTML pages in a directory are rendered and checked with axe.
- Source scans warn about files they skipped (e.g. `.svelte`) or when nothing was scannable, instead of reporting a clean result (CLI stderr, MCP extra block, `onWarning`).
- Scan several files or directories at once (CLI arguments, `scan([...])`, MCP `target` list).
- One `Finding` schema across engines, with a `fixHint` per finding.
- CLI with `--json`, `--fail-on`, `--tags`, `--wait-for`, and exit codes for CI.
- `scan()` and `exceedsThreshold()` library API (ESM and CJS, with types).
- MCP server (`a11y-checker mcp`) with `scan_page` and `explain_rule`.
- `a11y-fix` agent skill and Claude Code plugin manifest.
- Tests and CI (lint, typecheck, unit and integration).

### Changed
- Requires Node 22+. Web scans need `npx playwright install chromium`.

## 2.2.1

Last release of the v2 line.
