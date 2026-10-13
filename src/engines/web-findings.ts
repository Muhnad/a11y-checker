import type { NodeResult, Result } from 'axe-core';
import type { Finding, Impact } from '../types.js';

export const FIX_HINTS: Record<string, string> = {
  'document-title': 'Add a descriptive <title> inside <head>.',
  'html-has-lang': 'Add lang="<language code>" to <html>.',
  'html-lang-valid': 'Use a valid language code in the lang attribute of <html>.',
  'image-alt': 'Add alt="<description>" to the image, or alt="" if it is purely decorative.',
  'link-name': 'Give the link visible text, or an aria-label, that describes where it goes.',
  'button-name': 'Add visible text, aria-label or aria-labelledby to the button.',
  'svg-img-alt': 'Add role="img" with an accessible name, or aria-hidden="true" if decorative.',
  'frame-title': 'Add title="<what the frame contains>" to the frame.',
  label: 'Associate a <label for="<input id>"> with the field, or add aria-label.',
  tabindex: 'Remove positive tabindex values; use 0 or -1 and rely on DOM order.',
  'duplicate-id': 'Make every id on the page unique.',
  'meta-viewport': 'Remove user-scalable=no (and low maximum-scale) from <meta name="viewport">.',
  'page-has-heading-one': 'Add exactly one <h1> describing the page.',
  'video-caption': 'Add a <track kind="captions"> to the video.',
};

const toFinding = (violation: Result, node: NodeResult): Finding => ({
  engine: 'web',
  ruleId: violation.id,
  // axe leaves impact null only on non-violations.
  impact: (violation.impact ?? 'minor') as Impact,
  wcag: violation.tags.filter((tag) => tag.startsWith('wcag')),
  message: violation.help,
  helpUrl: violation.helpUrl,
  fixHint: FIX_HINTS[violation.id] ?? violation.help,
  selector: node.target.join(' '),
  html: node.html,
});

/** One Finding per offending element of each axe violation. */
export const toFindings = (violations: Result[]): Finding[] =>
  violations.flatMap((violation) => violation.nodes.map((node) => toFinding(violation, node)));
