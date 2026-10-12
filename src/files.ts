import { readdirSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';

// Kept apart from source.ts so routing a scan does not load the whole plugin stack.
export const SKIP_DIRS = ['node_modules', 'dist', 'build', '.next', 'coverage', '.git'];
export const FULL_DOCUMENT = /<html[\s>]|<!doctype/i;

/** Every file under a directory, skipping dependency and build folders. Paths are absolute. */
export function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => !f.split(sep).some((part) => SKIP_DIRS.includes(part)))
    .map((f) => join(dir, f));
}

/** Full HTML pages under a directory. They are rendered and checked with axe, not linted as template fragments. */
export function htmlDocuments(dir: string): string[] {
  return listFiles(dir).filter((f) => /\.html?$/i.test(f) && FULL_DOCUMENT.test(readFileSync(f, 'utf8')));
}
