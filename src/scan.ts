import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { htmlDocuments, isFullHtmlPage } from './engines/files.js';
import { flatMapSequentially } from './sequential.js';
import type { WebOptions, WebTarget } from './engines/web.js';
import type { Finding } from './types.js';

export type ScanOptions = WebOptions;

export type Target = WebTarget | { source: string };

/** A URL, an HTML file or string (rendered by the web engine), or a source file/directory (linted). */
export function resolveTarget(target: string): Target {
  const trimmed = target.trim();
  if (trimmed.startsWith('<')) return { html: trimmed };
  if (/^(https?|file):\/\//i.test(trimmed)) return { url: trimmed };

  const path = resolve(trimmed);
  if (!existsSync(path)) {
    throw new Error(`Unsupported target "${target}": expected a URL, a file or directory path, or an HTML string.`);
  }
  return isFullHtmlPage(path) ? { url: pathToFileURL(path).href } : { source: path };
}

// Imported on demand: a source scan never loads Playwright, a web scan never loads ESLint.
const scanWeb: typeof import('./engines/web.js').scanWeb = async (targets, opts) => (await import('./engines/web.js')).scanWeb(targets, opts);

async function scanSourcePath(path: string, opts: ScanOptions): Promise<Finding[]> {
  const { scanSource } = await import('./engines/source.js');
  const pages = statSync(path).isDirectory() ? htmlDocuments(path) : [];
  const renderedPages = pages.length ? await scanWeb(pages.map((page) => ({ url: pathToFileURL(page).href })), opts) : [];
  return [...(await scanSource(path, opts.onWarning)), ...renderedPages];
}

function scanOne(target: string, opts: ScanOptions): Promise<Finding[]> {
  const resolved = resolveTarget(target);
  return 'source' in resolved ? scanSourcePath(resolved.source, opts) : scanWeb(resolved, opts);
}

/** Scan one or several targets (URLs, HTML, files, directories); findings are concatenated in target order. */
export const scan = (target: string | string[], opts: ScanOptions = {}): Promise<Finding[]> =>
  flatMapSequentially([target].flat(), (t) => scanOne(t, opts));
