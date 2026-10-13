import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

// Here, not in source.ts, so routing a scan does not load the whole plugin stack.
export const SKIP_DIRS = ['node_modules', 'dist', 'build', '.next', 'coverage', '.git'];

const HTML_FILE = /\.html?$/i;
const FULL_DOCUMENT = /<html[\s>]|<!doctype/i;

export function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => !f.split(sep).some((part) => SKIP_DIRS.includes(part)))
    .map((f) => join(dir, f));
}

/** A complete page is rendered and checked with axe; an HTML fragment (an Angular template) is linted. */
export const isFullHtmlPage = (file: string): boolean =>
  HTML_FILE.test(file) && statSync(file).isFile() && FULL_DOCUMENT.test(readFileSync(file, 'utf8'));

export const htmlDocuments = (dir: string): string[] => listFiles(dir).filter(isFullHtmlPage);
