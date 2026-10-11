import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { scanWeb, type WebOptions, type WebTarget } from './web.js';
import type { Finding } from './types.js';

export type ScanOptions = WebOptions;

/** A URL, a path to an HTML file, or a raw HTML string. */
export function resolveTarget(target: string): WebTarget {
  const t = target.trim();
  if (t.startsWith('<')) return { html: t };
  if (/^(https?|file):\/\//i.test(t)) return { url: t };
  const path = resolve(t);
  if (existsSync(path) && statSync(path).isFile()) return { url: pathToFileURL(path).href };
  throw new Error(`Unsupported target "${target}": expected a URL, an HTML file path or an HTML string.`);
}

export async function scan(target: string, opts: ScanOptions = {}): Promise<Finding[]> {
  return scanWeb(resolveTarget(target), opts);
}
