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

  it('prints file and line for a source finding, without repeating the message as a fix', async () => {
    const sourceFinding: Finding = {
      engine: 'source',
      ruleId: 'jsx-a11y/alt-text',
      impact: 'serious',
      wcag: [],
      message: 'img elements must have an alt prop.',
      helpUrl: '',
      fixHint: 'img elements must have an alt prop.',
      file: 'src/Page.tsx',
      line: 4,
    };

    const { stdout } = await run(['src'], scanReturning(sourceFinding));

    expect(stdout).toContain('[serious] jsx-a11y/alt-text  src/Page.tsx:4');
    expect(stdout).not.toContain('Fix:');
  });

  it('prints the findings as parseable JSON with --json', async () => {
    const found = finding('critical');

    const { stdout } = await run(['page.html', '--json'], scanReturning(found));

    expect(JSON.parse(stdout)).toEqual([found]);
  });

  it('passes the target, tags and wait-for selector to the scan', async () => {
    const scan = scanReturning();

    await run(['https://example.com', '--tags', 'wcag2aa, wcag22aa', '--wait-for', '#app'], scan);

    expect(scan).toHaveBeenCalledWith(
      ['https://example.com'],
      expect.objectContaining({ tags: ['wcag2aa', 'wcag22aa'], waitFor: '#app' }),
    );
  });

  it('scans every target given on the command line', async () => {
    const scan = scanReturning();

    await run(['src/a', 'src/b.tsx'], scan);

    expect(scan).toHaveBeenCalledWith(['src/a', 'src/b.tsx'], expect.any(Object));
  });

  it('prints the file with the selector for a finding in a local HTML file', async () => {
    const { stdout } = await run(['page.html'], scanReturning({ ...finding('critical'), file: 'public/page.html' }));

    expect(stdout).toContain('[critical] image-alt  public/page.html img');
  });

  it('prints the page URL with the selector for a finding from a remote page', async () => {
    const { stdout } = await run(['https://example.com/about'], scanReturning({ ...finding('critical'), url: 'https://example.com/about' }));

    expect(stdout).toContain('[critical] image-alt  https://example.com/about img');
  });

  it('puts scan warnings on stderr and keeps stdout parseable JSON', async () => {
    const scan = vi.fn().mockImplementation(async (_targets: string[], opts: { onWarning?: (m: string) => void }) => {
      opts.onWarning?.('Skipped files with no source rules (1 .svelte).');
      return [];
    });

    const result = await run(['src', '--json'], scan);

    expect(result).toEqual({ code: 0, stdout: '[]', stderr: 'Warning: Skipped files with no source rules (1 .svelte).' });
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
