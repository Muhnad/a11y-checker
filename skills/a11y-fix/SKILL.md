---
name: a11y-fix
description: Find and fix accessibility problems in a web page or a React, Next.js or React Native codebase. Use when asked to audit, check or fix accessibility (a11y, WCAG, axe, screen reader, alt text, labels, contrast).
---

# a11y-fix

Scan, fix, rescan, report. Uses the `a11y-checker` MCP tools (`scan_page`, `explain_rule`); if they are not available, use the CLI: `npx a11y-checker <target> --json`.

## 1. Pick the target

- **Source code** (React, Next.js, React Native): scan the directory or file. Findings carry `file` and `line`. Works without a running app and is the only option for React Native.
- **Running app or page**: scan the URL (start the dev server first if needed). Findings carry a CSS `selector` and `html`. Use this too for Next.js, because it checks the rendered result (e.g. `next/image` alt, page title, contrast), which source scanning cannot.
- Do both for a web app when you can: source first, then the URL.

Next.js and multi-page apps have many routes. Scan each important route's URL.

## 2. Scan

Call `scan_page` with the target. Add `tags: ["wcag2aa", "wcag22aa"]` for a specific WCAG level. For client-rendered pages, pass `waitFor` with a selector that appears once the app has rendered.

## 3. Fix

Work through findings, most severe first (`critical`, `serious`, `moderate`, `minor`).

- Source findings: open `file` at `line` and fix it there.
- Web findings: locate the element in source. Search for distinctive text from `html`, the id, class or `data-testid` in `selector`. Fix the component that renders it, not just one instance.
- Use `fixHint` as the starting point; call `explain_rule` for a web `ruleId` when the hint is not enough.
- Prefer native HTML (`<button>`, `<label>`, `<nav>`) over adding ARIA. Add `lang` to `<html>`, an `alt` to images (`alt=""` only if decorative), a name to every control.

Do not guess content. Alt text, link text and labels must describe the real thing; if you cannot tell what an image or control is for, ask or leave it listed as unfixed.

## 4. Rescan

Scan the same target again. Repeat steps 3 and 4 until no fixable findings remain, at most three rounds.

## 5. Report

Give: what was fixed (rule, file), what remains, and why. Always call out these as needing a human:

- Color contrast (`color-contrast`): needs a design decision.
- Meaningful alt text, captions and transcripts.
- Anything automated tools cannot judge. Automated scanning finds only part of the problems; say so, and recommend a keyboard and screen reader pass.

## Known gaps

- Source scanning does not check Next.js `<Image>` alt text. The URL scan does.
- Source findings have no WCAG tags and are all reported as `serious`.
