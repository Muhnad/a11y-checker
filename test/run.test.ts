import { describe, expect, it, vi } from 'vitest';
import { run, USAGE } from '../src/run.js';
import type { Finding, Impact } from '../src/types.js';

const finding = (impact: Impact): Finding => ({
  engine: 'web',
  ruleId: 'image-alt',
  impact,
  wcag: ['wcag111'],
  message: 'Images must have alternate text',
  helpUrl: 'https://dequeuniversity.com/rules/axe/4.14/image-alt',
  fixHint: 'Add an alt attribute.',
  selector: 'img',
});

const scanReturning = (...findings: Finding[]) => vi.fn().mockResolvedValue(findings);

describe('run', () => {
  it('exits 0 and says so when there are no findings', async () => {
    const result = await run(['page.html'], scanReturning());

    expect(result).toEqual({ code: 0, stdout: 'No accessibility issues found.', stderr: '' });
  });

  it('exits 1 when a finding meets the default threshold', async () => {
    const result = await run(['page.html'], scanReturning(finding('minor')));

    expect(result.code).toBe(1);
  });

  it('exits 0 when every finding is below --fail-on', async () => {
    const result = await run(['page.html', '--fail-on', 'serious'], scanReturning(finding('moderate')));

    expect(result.code).toBe(0);
  });

  it('exits 1 when a finding is at --fail-on', async () => {
    const result = await run(['page.html', '--fail-on', 'serious'], scanReturning(finding('serious')));

    expect(result.code).toBe(1);
  });

  it('prints rule, selector, fix hint and help link in human output', async () => {
    const { stdout } = await run(['page.html'], scanReturning(finding('critical')));

    expect(stdout).toContain('[critical] image-alt  img');
    expect(stdout).toContain('Fix: Add an alt attribute.');
    expect(stdout).toContain('https://dequeuniversity.com/rules/axe/4.14/image-alt');
  });

  it('prints the findings as parseable JSON with --json', async () => {
    const found = finding('critical');

    const { stdout } = await run(['page.html', '--json'], scanReturning(found));

    expect(JSON.parse(stdout)).toEqual([found]);
  });

  it('passes the target, tags and wait-for selector to the scan', async () => {
    const scan = scanReturning();

    await run(['https://example.com', '--tags', 'wcag2aa, wcag22aa', '--wait-for', '#app'], scan);

    expect(scan).toHaveBeenCalledWith('https://example.com', { tags: ['wcag2aa', 'wcag22aa'], waitFor: '#app' });
  });

  it('prints usage and exits 2 without a target', async () => {
    const result = await run([], scanReturning());

    expect(result).toEqual({ code: 2, stdout: '', stderr: USAGE });
  });

  it('prints usage and exits 2 for an unknown --fail-on value', async () => {
    const result = await run(['page.html', '--fail-on', 'bad'], scanReturning());

    expect(result).toEqual({ code: 2, stdout: '', stderr: USAGE });
  });

  it('exits 2 with the message for an unknown option', async () => {
    const result = await run(['page.html', '--nope'], scanReturning());

    expect(result.code).toBe(2);
    expect(result.stderr).toContain('--nope');
  });

  it('exits 2 with the error message when the scan fails', async () => {
    const scan = vi.fn().mockRejectedValue(new Error('net::ERR_NAME_NOT_RESOLVED'));

    const result = await run(['https://nope.invalid'], scan);

    expect(result).toEqual({ code: 2, stdout: '', stderr: 'net::ERR_NAME_NOT_RESOLVED' });
  });

  it('prints usage and exits 0 for --help', async () => {
    const result = await run(['--help'], scanReturning());

    expect(result).toEqual({ code: 0, stdout: USAGE, stderr: '' });
  });
});
