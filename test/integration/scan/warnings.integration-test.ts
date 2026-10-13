import { describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture } from '../../helpers.js';

describe('scan warnings', () => {
  const warningsFor = async (path: string) => {
    const warnings: string[] = [];
    const findings = await scan(fixture(path), { onWarning: (w) => warnings.push(w) });
    return { findings, warnings };
  };

  it('says which files were skipped instead of looking clean', async () => {
    const { findings, warnings } = await warningsFor('scan/unlinted');

    expect(findings).toEqual([]);
    expect(warnings).toEqual([expect.stringContaining('1 .svelte')]);
  });

  it('warns for a single unsupported file and reports no fake finding', async () => {
    const { findings, warnings } = await warningsFor('scan/unlinted/App.svelte');

    expect(findings).toEqual([]);
    expect(warnings).toEqual([expect.stringContaining('.svelte')]);
  });

  it('warns when a directory has nothing to scan', async () => {
    const { warnings } = await warningsFor('scan/empty');

    expect(warnings).toEqual([expect.stringContaining('No files with source rules')]);
  });

  it('does not warn when everything was scanned', async () => {
    expect((await warningsFor('react/clean')).warnings).toEqual([]);
    expect((await warningsFor('scan/mixed')).warnings).toEqual([]);
  });
});
