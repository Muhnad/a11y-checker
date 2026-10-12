# a11y-checker

Agent-native accessibility scanner: CLI, MCP server and agent skill over two engines (`web`: Playwright + axe-core, `source`: ESLint a11y plugins) that return one `Finding` schema. Node 22+, TypeScript, ESM + CJS via tsup.

## Commands

- `npm install && npx playwright install chromium`
- `npm run lint`, `npm run typecheck`
- `npm run test:unit`: unit tests, no browser
- `npm test`: builds, then runs everything, including real Chromium and ESLint

## Conventions

- Unit tests are `test/*.test.ts`. Integration tests are `test/*.integration-test.ts`: real ESLint, plugins and Chromium, nothing stubbed. Put each behaviour on the lowest layer that can catch it.
- Engines and framework plugins are imported lazily (`await import(...)`) so start-up stays fast. Don't add a static import of `web.js`, `source.ts` or a plugin to `cli.ts`, `scan.ts` or `run.ts`.
- ESLint stays on 9: `eslint-plugin-jsx-a11y` peers only up to 9.
- `eslint-plugin-astro` is an optional peer on purpose (its ESLint 9 releases pull in an unpatched `braces`). Don't move it to `dependencies`.
- The agent workflow is written once, in `skills/a11y-fix/SKILL.md`. The MCP prompt (`src/mcp.ts`), `install-skill` and the Claude Code plugin all deliver that file: change it there, not in copies.
- Don't commit, push, publish or tag unless asked.
