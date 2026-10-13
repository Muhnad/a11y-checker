# a11y-checker

Agent-native accessibility scanner: CLI, MCP server and agent skill over two engines (`web`: Playwright + axe-core, `source`: ESLint a11y plugins) that return one `Finding` schema. Node 22+, TypeScript, ESM + CJS via tsup.

## Commands

- `npm install && npx playwright install chromium`
- `npm run lint`, `npm run typecheck`
- `npm run test:unit`: unit tests, no browser
- `npm test`: builds, then runs everything, including real Chromium and ESLint

## Conventions

- Tests live in `test/`. Unit tests are `test/unit/<src-module>.test.ts`: no browser, mocks allowed. Integration tests are `test/integration/<area>/<subject>.integration-test.ts`: real ESLint, plugins, Chromium or the built binary, nothing stubbed. Put each behaviour on the lowest layer that can catch it.
- Integration areas: one folder per framework (`react`, `vue`, `astro`, `angular`, `html`), `scan/` for cross-framework scans (mixed code, warnings, `resolveTarget`, real-project noise), and `cli`, `mcp`, `package` for the three delivery surfaces. File names are kebab-case.
- Fixtures are shared in `test/fixtures/`, grouped by the same names (`react/web`, `vue`, `html/bad.html`, `scan/mixed`). Helpers shared by integration tests go in `test/helpers.ts` (not a test file).
- `src/`: `cli.ts` and `index.ts` are the entry points, `engines/` holds the two scan engines, `commands/` the CLI commands, `mcp/` the MCP server; `scan.ts`, `types.ts`, `threshold.ts` and `sequential.ts` are shared. `manifest.ts` and `skill.ts` stay at the root because they find `package.json` and `skills/` with `new URL('../…', import.meta.url)`, which works only one level below the package root (`src/` and the flat `dist/`).
- Engines and framework plugins are imported lazily (`await import(...)`) so start-up stays fast. Don't add a static import of `engines/web.js`, `engines/source.ts` or a plugin to `cli.ts`, `scan.ts` or `commands/run.ts`.
- ESLint stays on 9: `eslint-plugin-jsx-a11y` peers only up to 9.
- `eslint-plugin-astro` is an optional peer on purpose (its ESLint 9 releases pull in an unpatched `braces`). Don't move it to `dependencies`.
- The agent workflow is written once, in `skills/a11y-fix/SKILL.md`. The MCP prompt (`src/mcp/server.ts`), `install-skill` and the Claude Code plugin all deliver that file: change it there, not in copies.
- Don't commit, push, publish or tag unless asked.
