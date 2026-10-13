export const IMPACTS = ['minor', 'moderate', 'serious', 'critical'] as const;
export type Impact = (typeof IMPACTS)[number];

export type EngineName = 'web' | 'source';

/** One accessibility problem, in the same shape for every engine. */
export interface Finding {
  engine: EngineName;
  ruleId: string;
  impact: Impact;
  /** WCAG tags such as `wcag2aa` or `wcag143`. */
  wcag: string[];
  message: string;
  helpUrl: string;
  /** Short, actionable sentence an agent or human can follow. */
  fixHint: string;
  /** `web`: CSS selector of the offending element. */
  selector?: string;
  /** `web`: the page a URL target was loaded from, so findings from several pages can be told apart. */
  url?: string;
  /** `source`, or `web` for a local HTML file: location of the offending code. */
  file?: string;
  line?: number;
  /** `web`: HTML snippet of the offending element. */
  html?: string;
}
