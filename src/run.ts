import { parseArgs } from 'node:util';
import { scan, type ScanOptions } from './scan.js';
import { exceedsThreshold } from './threshold.js';
import type { Finding, Impact } from './types.js';

const IMPACTS: Impact[] = ['minor', 'moderate', 'serious', 'critical'];

export const USAGE = `Usage: a11y-checker <url | html-file | html-string> [options]

Options:
  --json               Print findings as JSON
  --fail-on <impact>   Exit 1 if any finding is at or above: ${IMPACTS.join(' | ')} (default: minor)
  --tags <list>        Comma-separated axe tags, e.g. wcag2aa,wcag22aa
  --wait-for <css>     Wait for this selector before auditing
  -h, --help           Show this help

Exit codes: 0 = ok, 1 = findings at/above threshold, 2 = usage or runtime error`;

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

function format(findings: Finding[]): string {
  if (!findings.length) return 'No accessibility issues found.';
  const lines = findings.map(
    (f) =>
      `[${f.impact}] ${f.ruleId}  ${f.selector ?? `${f.file}:${f.line}`}\n  ${f.message}\n  Fix: ${f.fixHint}\n  ${f.helpUrl}`,
  );
  return `${lines.join('\n\n')}\n\n${findings.length} issue(s) found.`;
}

/** The whole CLI, minus process I/O, so it can be tested without spawning. */
export async function run(
  argv: string[],
  scanFn: (target: string, opts: ScanOptions) => Promise<Finding[]> = scan,
): Promise<RunResult> {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        json: { type: 'boolean' },
        'fail-on': { type: 'string', default: 'minor' },
        tags: { type: 'string' },
        'wait-for': { type: 'string' },
        help: { type: 'boolean', short: 'h' },
      },
    });

    if (values.help) return { code: 0, stdout: USAGE, stderr: '' };

    const [target] = positionals;
    const failOn = values['fail-on'] as Impact;
    if (!target || positionals.length > 1 || !IMPACTS.includes(failOn)) {
      return { code: 2, stdout: '', stderr: USAGE };
    }

    const findings = await scanFn(target, {
      tags: values.tags?.split(',').map((t) => t.trim()),
      waitFor: values['wait-for'],
    });
    return {
      code: exceedsThreshold(findings, failOn) ? 1 : 0,
      stdout: values.json ? JSON.stringify(findings, null, 2) : format(findings),
      stderr: '',
    };
  } catch (err) {
    return { code: 2, stdout: '', stderr: err instanceof Error ? err.message : String(err) };
  }
}
