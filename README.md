# a11y-checker

> Accessibility scanner for web pages and React, Next.js and React Native code. Built for CI and for AI agents: structured findings with a fix hint for each.

- **Web engine**: renders a URL or HTML in Chromium and runs [axe-core](https://github.com/dequelabs/axe-core). Works for any framework (React, Next.js, Vue, Svelte, plain HTML).
- **Source engine**: lints JS/TS/JSX/TSX with [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) and [eslint-plugin-react-native-a11y](https://github.com/FormidableLabs/eslint-plugin-react-native-a11y). No running app needed; the only option for React Native.
- **Agent ready**: a CLI with `--json`, an MCP server, and a Claude skill that scans, fixes and rescans.

> Upgrading from v2? v3 is a rewrite. See [Migrating from v2](#migrating-from-v2).

## Install

```bash
npm install --save-dev a11y-checker
npx playwright install chromium   # needed for web scans
```

Requires Node 22+. The Chromium download is only needed for the web engine; source scans don't use it.

## CLI

```bash
npx a11y-checker https://example.com          # a URL
npx a11y-checker ./dist/index.html            # an HTML file
npx a11y-checker src                          # a source directory (React, Next.js, React Native)
npx a11y-checker src/Button.tsx               # a single source file
npx a11y-checker '<img src="a.png">'          # an HTML string
```

The target decides the engine: URLs, HTML files and HTML strings use `web`; any other file or directory uses `source`.

| Option | Description |
| --- | --- |
| `--json` | Print findings as a JSON array |
| `--fail-on <impact>` | Exit 1 if any finding is at or above `minor`, `moderate`, `serious` or `critical` (default `minor`) |
| `--tags <list>` | Comma-separated axe tags, e.g. `wcag2aa,wcag22aa` (web only) |
| `--wait-for <css>` | Wait for this selector before scanning (web only) |

Exit codes: `0` ok, `1` findings at or above the threshold, `2` usage or runtime error.

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

const findings = await scan('https://example.com', { tags: ['wcag2aa'] });
if (exceedsThreshold(findings, 'serious')) process.exit(1);
```

## Use with AI agents

**MCP server.** Exposes `scan_page` and `explain_rule` over stdio:

```bash
claude mcp add a11y-checker -- npx -y a11y-checker mcp
```

For other clients, use the command `npx -y a11y-checker mcp` in their MCP config.

**Skill.** [`skills/a11y-fix/SKILL.md`](skills/a11y-fix/SKILL.md) teaches an agent to scan, fix, rescan and report what needs a human. Copy the `a11y-fix` folder to `~/.claude/skills/` (or `.claude/skills/` in a project). The repo is also a Claude Code plugin (`.claude-plugin/plugin.json`).

## Limits

- Automated checks find only part of the problems. Do a keyboard and screen reader pass too.
- Source findings carry no WCAG tags and are all reported as `serious`, because the ESLint rules don't provide them.
- The source engine doesn't check Next.js `<Image>` alt text. The web engine does.
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
