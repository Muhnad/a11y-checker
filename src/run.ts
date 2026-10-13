import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { scan, type ScanOptions } from './scan.js';
import { exceedsThreshold } from './threshold.js';
import type { Finding, Impact } from './types.js';

const IMPACTS: Impact[] = ['minor', 'moderate', 'serious', 'critical'];

export const USAGE = `Usage: a11y-checker <target>... [options]
       a11y-checker mcp    Start the MCP server on stdio
       a11y-checker init [dir] [--yes]
                       Install a11y-checker and the plugins the project needs with its package manager
       a11y-checker install-skill [--global] [--force] [--agent all|agents|claude]
                       Copy the a11y-fix skill to .agents/skills and .claude/skills (or under ~ with --global)

Targets: a URL, HTML string, HTML file, source file or directory. Pass several to scan only those.

Options:
  --json               Print findings as JSON
  --fail-on <impact>   Exit 1 if any finding is at or above: ${IMPACTS.join(' | ')} (default: minor)
  --tags <list>        Comma-separated axe tags, e.g. wcag2aa,wcag22aa
  --wait-for <css>     Wait for this selector before auditing
  --changed            Scan only source files changed since HEAD (plus new files); targets limit the search
  -h, --help           Show this help

Exit codes: 0 = ok, 1 = findings at/above threshold, 2 = usage or runtime error`;

const SCANNABLE = /\.(jsx?|tsx?|vue|astro|html?)$/i;

/** Files changed since HEAD plus untracked ones, as paths relative to cwd; `pathspec` narrows the search. */
function changedFiles(pathspec: string[]): string[] {
  // -z: names come back NUL-separated and unquoted, so accented or spaced file names survive.
  const git = (...args: string[]) =>
    execFileSync('git', [...args, '--', ...pathspec], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const files = [...git('diff', '-z', '--name-only', '--relative', '--diff-filter=d', 'HEAD'), ...git('ls-files', '-z', '--others', '--exclude-standard')];
  return [...new Set(files)].filter((f) => SCANNABLE.test(f));
}

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

function format(findings: Finding[]): string {
  if (!findings.length) return 'No accessibility issues found.';
  const lines = findings.map((f) =>
    [
      `[${f.impact}] ${f.ruleId}  ${f.selector ? [f.file ?? f.url, f.selector].filter(Boolean).join(' ') : `${f.file}:${f.line}`}`,
      `  ${f.message}`,
      f.fixHint !== f.message && `  Fix: ${f.fixHint}`,
      f.helpUrl && `  ${f.helpUrl}`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
  return `${lines.join('\n\n')}\n\n${findings.length} issue(s) found.`;
}

/** The whole CLI, minus process I/O, so it can be tested without spawning. */
export async function run(
  argv: string[],
  scanFn: (targets: string[], opts: ScanOptions) => Promise<Finding[]> = scan,
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
        changed: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });

    if (values.help) return { code: 0, stdout: USAGE, stderr: '' };

    const failOn = values['fail-on'] as Impact;
    if ((!positionals.length && !values.changed) || !IMPACTS.includes(failOn)) {
      return { code: 2, stdout: '', stderr: USAGE };
    }
    const targets = values.changed ? changedFiles(positionals) : positionals;
    if (!targets.length) return { code: 0, stdout: values.json ? '[]' : format([]), stderr: '' };

    // Warnings go to stderr so `--json` output on stdout stays parseable.
    const warnings: string[] = [];
    const findings = await scanFn(targets, {
      tags: values.tags?.split(',').map((t) => t.trim()),
      waitFor: values['wait-for'],
      onWarning: (w) => warnings.push(`Warning: ${w}`),
    });
    return {
      code: exceedsThreshold(findings, failOn) ? 1 : 0,
      stdout: values.json ? JSON.stringify(findings, null, 2) : format(findings),
      stderr: warnings.join('\n'),
    };
  } catch (err) {
    return { code: 2, stdout: '', stderr: err instanceof Error ? err.message : String(err) };
  }
}
