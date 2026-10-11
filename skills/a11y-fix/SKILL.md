---
name: a11y-fix
description: Find and fix accessibility problems in a web page or codebase (React, Next.js, React Native, Angular, plain HTML/JS), or in just the files or directories the user names. Use when asked to audit, check or fix accessibility (a11y, WCAG, axe, screen reader, alt text, labels, contrast).
---

# a11y-fix

Scan, fix, rescan, report. Uses the `a11y-checker` MCP tools (`scan_page`, `explain_rule`); if they are not available, use the CLI: `npx a11y-checker <target> --json`. The CLI prints a bare JSON array of findings and exits 1 when there are any (that is not a crash).

## 1. Pick the target

**Scope first.** Scan only what the user named: a file, several files, a directory or a URL. Pass them all in one call (`target` can be a list; the CLI takes several arguments). If they named nothing, ask which files or directories; scan the whole project only when they ask for the whole codebase. Only edit files inside that scope, and report (do not fix) findings that point outside it.

- **Source code**: scan the directory or file. A directory scan covers JS/TS/JSX/TSX (React, Next.js, React Native), Vue (`.vue`), Astro (`.astro`, needs `eslint-plugin-astro` installed in the project), Angular templates (`.html` fragments and inline `template:` strings in `*.component.ts`), and full HTML pages (rendered and checked with axe). Svelte, template engines and DOM code built in plain JS (`document.createElement`) are not linted statically; scan the running page's URL instead. Findings carry `file` and `line`. Works without a running app and is the only option for React Native.
- **Running app or page**: scan the URL (start the dev server first if needed). Findings carry a CSS `selector` and `html`. Use this too for Next.js, because it checks the rendered result (e.g. `next/image` alt, page title, contrast), which source scanning cannot.
- Do both for a web app when you can: source first, then the URL.

An `.html` file path is rendered directly, no server needed. A directory or any other file is linted as source.

Next.js and multi-page apps have many routes. Scan each important route's URL.

## 2. Scan

Call `scan_page` with the target. If the result (or the CLI's stderr) carries a `Warning:` about skipped files or nothing to scan, those files were **not checked**. Never report a clean result for them: say so, and scan the running app's URL instead (or ask for it). Add `tags: ["wcag2aa", "wcag22aa"]` for a specific WCAG level. For client-rendered pages, pass `waitFor` with a selector that appears once the app has rendered.

## 3. Fix

Work through findings, most severe first (`critical`, `serious`, `moderate`, `minor`). Source findings are all `serious`, so order those by file.

Fix the root cause, then rescan: one change often clears several findings (a clickable `<div>` turned into a `<button>`, one missing `<main>`).

- Source findings: open `file` at `line` and fix it there.
- Web findings: locate the element in source. Search for distinctive text from `html`, the id, class or `data-testid` in `selector`. Fix the component that renders it, not just one instance.
- Use `fixHint` as the starting point; call `explain_rule` for a web `ruleId` when the hint is not enough.
- Prefer native HTML (`<button>`, `<label>`, `<nav>`) over adding ARIA. Add `lang` to `<html>`, an `alt` to images (`alt=""` only if decorative), a name to every control.

Do not guess content. These need the real content and count as **not fixable by you**: alt text, link text, button names, page `<title>` and `<h1>`. If you cannot tell what something is for, ask; if you cannot ask, leave it and list it in the report.

## 4. Rescan

Scan the same target again. Repeat steps 3 and 4 until only findings that need real content remain, at most three rounds.

## 5. Report

Give: what was fixed (rule, file), what remains, and why. Always call out these as needing a human:

- Color contrast (`color-contrast`): needs a design decision.
- Meaningful alt text, captions and transcripts.
- Anything automated tools cannot judge. Automated scanning finds only part of the problems; say so, and recommend a keyboard and screen reader pass.

## Known gaps

- Source scanning does not check Next.js `<Image>` alt text. The URL scan does.
- Source findings have no WCAG tags and are all reported as `serious`.
- Source scanning does not cover Svelte, template engines or markup built by plain JS; use the URL scan for those.
