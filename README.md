# a11y-checker

> Framework-agnostic accessibility scanner for AI agents and CI. Scan any web app, whatever it is built with, or lint source code directly. Scan a whole project or just the files and directories you name. Findings are structured, each with a fix hint.

- **Web engine (any framework)**: renders a URL, an HTML page or an HTML string in Chromium and runs [axe-core](https://github.com/dequelabs/axe-core). It checks what the browser actually shows, so it works for any stack: React, Next.js, Angular, Vue, Svelte, plain HTML/JS and more.
- **Source engine (no running app needed)**: lints code directly. Supported today:
  - React and Next.js (JS/TS/JSX/TSX) with [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
  - React Native with [eslint-plugin-react-native-a11y](https://github.com/FormidableLabs/eslint-plugin-react-native-a11y), the only option for React Native
  - Vue single-file components (including `<script lang="ts">`) with [eslint-plugin-vuejs-accessibility](https://github.com/vue-a11y/eslint-plugin-vuejs-accessibility)
  - Astro (`.astro`) with the jsx-a11y rules from [eslint-plugin-astro](https://github.com/ota-meshi/eslint-plugin-astro). Optional: run `npx a11y-checker init` to enable it
  - Angular templates (`.html` and inline `template:`) with [@angular-eslint](https://github.com/angular-eslint/angular-eslint)
  - A directory scan also renders any full HTML pages it finds.
- **Agent ready**: a CLI with `--json`, an MCP server, an agent skill and an `AGENTS.md` block. An agent scans, fixes and rescans, limited to the files or directories you name.

For frameworks without a source linter yet (Svelte, template engines such as Handlebars or EJS), scan the running app's URL. A source scan tells you when it skipped files it has no rules for, so a clean result is never silent about what it didn't check.

> Upgrading from v2? v3 is a rewrite. See [Migrating from v2](#migrating-from-v2).

## Install

```bash
npm install --save-dev a11y-checker
npx playwright install chromium   # needed for web scans
```

`npx a11y-checker init` does the install for you: it adds `a11y-checker` and, for an Astro project, `eslint-plugin-astro`, using the project's package manager after asking. It also offers to add the a11y instructions to `AGENTS.md`. It only prints what it would do when it isn't run in a terminal, and `--yes` skips the questions.

Requires Node 22+. The Chromium download is only needed for the web engine; source scans don't use it.

## CLI

```bash
npx a11y-checker https://example.com          # a URL
npx a11y-checker ./dist/index.html            # an HTML file
npx a11y-checker src                          # a source directory (React, Next.js, React Native)
npx a11y-checker src/Button.tsx               # a single source file
npx a11y-checker src/cart src/Header.tsx      # only these directories and files
npx a11y-checker '<img src="a.png">'          # an HTML string
```

Pass several targets to scan only those. The target decides the engine: URLs, full HTML pages and HTML strings use `web`; other files and directories use `source`. A directory scan covers every kind it finds: JS/TS/JSX/TSX, Angular templates (`.html` fragments and inline `template:` strings) and full HTML pages (rendered and checked with axe).

| Option | Description |
| --- | --- |
| `--json` | Print findings as a JSON array |
| `--fail-on <impact>` | Exit 1 if any finding is at or above `minor`, `moderate`, `serious` or `critical` (default `minor`) |
| `--tags <list>` | Comma-separated axe tags, e.g. `wcag2aa,wcag22aa` (web only) |
| `--wait-for <css>` | Wait for this selector before scanning (web only) |
| `--changed` | Scan only source files changed since `HEAD` plus new files. Targets, if given, limit the search. Fast for CI and for rescans after a fix |

Exit codes: `0` ok, `1` findings at or above the threshold, `2` usage or runtime error. Notes about skipped files go to stderr as `Warning: ...`, so `--json` output stays parseable.

Each finding looks like this:

```json
{
  "engine": "web",
  "ruleId": "image-alt",
  "impact": "critical",
  "wcag": ["wcag2a", "wcag111"],
  "message": "Images must have alternative text",
  "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/image-alt",
  "fixHint": "Add alt=\"<description>\" to the image, or alt=\"\" if it is purely decorative.",
  "selector": "img",
  "html": "<img src=\"a.png\">"
}
```

Source findings have `file` and `line` instead of `selector` and `html`.

## Frameworks

| Project | Scan | Notes |
| --- | --- | --- |
| React, Vue, Svelte, any web app | URL of the running app | Checks the rendered page, including contrast |
| Next.js | `src` or `app` directory, and each route's URL | Source scan is static; the URL scan catches what only exists at runtime, such as `next/image` alt text |
| Angular | the source directory, and the running app's URL | Source scan lints `.html` templates and inline `template:` strings |
| Plain HTML | the file or directory | Pages are rendered and checked with axe |
| Vue | the source directory, and the running app's URL | Source scan lints `.vue` files |
| Astro | the source directory, and the running site's URL | Source scan lints `.astro` files once `eslint-plugin-astro` is installed (see below); without it they are skipped with a warning |
| Svelte, DOM built in plain JS | URL of the running app | No static source rules yet; a source scan warns that it skipped these files |
| React Native | the source directory | Static only. There is no runtime scan of a device or simulator yet |

For multi-page apps, scan each route's URL.

## Use in CI

```yaml
- run: npm ci
- run: npx playwright install --with-deps chromium
- run: npx a11y-checker src --fail-on serious
```

## Use from code

```js
import { scan, exceedsThreshold } from 'a11y-checker';

const findings = await scan('https://example.com', { tags: ['wcag2aa'], onWarning: console.warn }); // or scan(['src/a', 'src/b.tsx'])
if (exceedsThreshold(findings, 'serious')) process.exit(1);
```

## Use with AI agents

Three pieces work with any coding agent. Use any of them; none is tied to one vendor.

- **MCP server** exposes `scan_page`, `explain_rule` and an `a11y-fix` prompt (the scan, fix, rescan, report workflow, with an optional `target` argument). Add a stdio server with the command `npx -y a11y-checker mcp`. Most clients take the JSON below, but the file it goes in and the top-level key (`mcpServers`, `servers`, ...) differ per client, so check your client's docs.
- **Skill**, [`skills/a11y-fix/SKILL.md`](skills/a11y-fix/SKILL.md), in the open [Agent Skills](https://agentskills.io) format, teaches the same workflow. It works on the files, directories or URLs you name ("check `src/components`"), not the whole codebase unless you ask.
- **`AGENTS.md`**, the file most agents read for project instructions, tells the agent to scan after UI changes.

```json
{
  "mcpServers": {
    "a11y-checker": { "command": "npx", "args": ["-y", "a11y-checker", "mcp"] }
  }
}
```

```bash
npx a11y-checker init                 # installs a11y-checker, then offers to add the a11y block to AGENTS.md
npx a11y-checker install-skill        # skill into .agents/skills and .claude/skills of this project
npx a11y-checker install-skill --global                # ... or ~/.agents/skills and ~/.claude/skills
npx a11y-checker install-skill --agent agents          # only the cross-client .agents/skills (or --agent claude)
```

`init` and `install-skill` ask before writing and never overwrite your files: `init` only edits the marked block it owns in `AGENTS.md` (and prints the text instead when it isn't run in a terminal), and `install-skill` refuses to replace an existing install unless you pass `--force`.

How agents pick these up:

| Agent | Skill | `AGENTS.md` |
| --- | --- | --- |
| Claude Code | `.claude/skills` (`install-skill`) or the plugin below | Add `@AGENTS.md` to `CLAUDE.md` |
| Codex, Cursor and other [Agent Skills](https://agentskills.io) clients | `.agents/skills` (`install-skill`) | Read natively |
| Gemini CLI | `.agents/skills` | Set `context.fileName` to `["AGENTS.md"]` in `.gemini/settings.json` |
| Aider | n/a, use the MCP prompt | Add `read: AGENTS.md` to `.aider.conf.yml` |
| Any other MCP client | n/a, use the `a11y-fix` prompt | See your client's docs |

**Claude Code plugin** (skill and MCP server together):

```
/plugin marketplace add Muhnad/a11y-checker
/plugin install a11y-checker@a11y-checker
```

## Limits

- Automated checks find only part of the problems. Do a keyboard and screen reader pass too.
- Source findings carry no WCAG tags and are all reported as `serious`, because the ESLint rules don't provide them.
- The source engine doesn't check Next.js `<Image>` alt text. The web engine does.
- Angular templates are linted with `@angular-eslint`'s accessibility rules. They can't see content that only exists at runtime; scan the running app too.
- Source scanning skips file types it has no rules for (for example `.svelte`, `.hbs`, `.ejs`) and says so with a warning. The warning comes through the CLI's stderr, as an extra block after the findings in the MCP result, and through `onWarning` in `scan()`.
- `eslint-plugin-astro` is an optional peer dependency, not installed by default: the releases that work with ESLint 9 depend on a package (`braces`) with an unpatched advisory, and we don't want it in every install. Install it only if you scan Astro code: `npx a11y-checker init` adds it, and `a11y-checker` itself, to the project (it finds the right package manager from the lockfile and asks first). The plugin is looked up from the scanned directory, so a bare `npx a11y-checker` finds it too.
- Rules are axe-core's and the two ESLint plugins'; see [axe rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md).

## Migrating from v2

v2 ran ~19 hand-written checks in the browser and logged to the console (`a11yChecker()`). v3 removes that API and replaces it with the engines above. Replace the call with a CLI or `scan()` step in CI or in your agent. The v2 code is kept on the `v2` branch and the `v2.2.1` tag.

## Contributing

```bash
git clone git@github.com:Muhnad/a11y-checker.git
cd a11y-checker
npm install
npx playwright install chromium
npm test
```

| Command | Description |
| --- | --- |
| `npm run build` | Build `dist/` with tsup |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Build, then run all tests (including real Chromium and ESLint) |
| `npm run test:unit` | Unit tests only, no browser |

Please [open an issue](https://github.com/Muhnad/a11y-checker/issues/new/choose) before a large change.

## Other tools

| Tool | Description |
| --- | --- |
| [axe-core](https://github.com/dequelabs/axe-core) | The accessibility rules engine behind the web scan |
| [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) | Static a11y rules for JSX |
| [eslint-plugin-react-native-a11y](https://github.com/FormidableLabs/eslint-plugin-react-native-a11y) | Static a11y rules for React Native |
| [Awesome a11y validators](https://github.com/brunopulis/awesome-a11y/blob/master/topics/validators.md) | More testing and validation tools |

## License

MIT
