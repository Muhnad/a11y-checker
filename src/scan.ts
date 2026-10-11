import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { scanSource } from './source.js';
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
    return HTML_FILE.test(path) ? { url: pathToFileURL(path).href } : { source: path };
  }
  throw new Error(`Unsupported target "${target}": expected a URL, a file or directory path, or an HTML string.`);
}

export async function scan(target: string, opts: ScanOptions = {}): Promise<Finding[]> {
  const resolved = resolveTarget(target);
  return 'source' in resolved ? scanSource(resolved.source) : scanWeb(resolved, opts);
}
