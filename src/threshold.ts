import { IMPACTS, type Finding, type Impact } from './types.js';

const severity = (impact: Impact) => IMPACTS.indexOf(impact);

/** True when any finding is at or above the `failOn` impact. */
export const exceedsThreshold = (findings: Finding[], failOn: Impact): boolean =>
  findings.some((f) => severity(f.impact) >= severity(failOn));
