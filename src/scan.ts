import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { FULL_DOCUMENT, htmlDocuments, scanSource } from './source.js';
import { scanWeb, type WebOptions, type WebTarget } from './web.js';
import type { Finding } from './types.js';

export type ScanOptions = WebOptions;

export type Target = WebTarget | { source: string };

const HTML_FILE = /\.html?$/i;

/** A URL, an HTML file or string (rendered by the web engine), or a source file/directory (linted). */
export function resolveTarget(target: string): Target {
  const t = target.trim();
  if (t.startsWith('<')) return { html: t };
  if (/^(https?|file):\/\//i.test(t)) return { url: t };
  const path = resolve(t);
  if (existsSync(path)) {
    if (statSync(path).isDirectory()) return { source: path };
    // An HTML file that is a full page is rendered; a fragment (e.g. an Angular template) is linted.
    if (HTML_FILE.test(path) && FULL_DOCUMENT.test(readFileSync(path, 'utf8'))) return { url: pathToFileURL(path).href };
    return { source: path };
  }
  throw new Error(`Unsupported target "${target}": expected a URL, a file or directory path, or an HTML string.`);
}

async function scanOne(target: string, opts: ScanOptions): Promise<Finding[]> {
  const resolved = resolveTarget(target);
  if (!('source' in resolved)) return scanWeb(resolved, opts);

  const pages = statSync(resolved.source).isDirectory() ? htmlDocuments(resolved.source) : [];
  const web = pages.length ? await scanWeb(pages.map((p) => ({ url: pathToFileURL(p).href })), opts) : [];
  return [...(await scanSource(resolved.source, opts.onWarning)), ...web];
}

/** Scan one or several targets (URLs, HTML, files, directories); findings are concatenated in target order. */
export async function scan(target: string | string[], opts: ScanOptions = {}): Promise<Finding[]> {
  const findings: Finding[] = [];
  // Sequential on purpose: each web target launches its own browser.
  for (const t of [target].flat()) findings.push(...(await scanOne(t, opts)));
  return findings;
}
