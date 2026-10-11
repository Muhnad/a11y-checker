import type { Finding, Impact } from './types.js';

const ORDER: Impact[] = ['minor', 'moderate', 'serious', 'critical'];

/** True when any finding is at or above the `failOn` impact. */
export function exceedsThreshold(findings: Finding[], failOn: Impact): boolean {
  const min = ORDER.indexOf(failOn);
  return findings.some((f) => ORDER.indexOf(f.impact) >= min);
}
