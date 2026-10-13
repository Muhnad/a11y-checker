import { readFileSync } from 'node:fs';

interface Manifest {
  version: string;
  peerDependencies: Record<string, string>;
}

// package.json sits next to src/ and dist/ alike.
export const readManifest = (): Manifest => JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
