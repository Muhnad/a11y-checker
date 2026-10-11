import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/mcp.js';

const fixture = (path: string) => new URL(`./fixtures/${path}`, import.meta.url).pathname;

// A real MCP client talking to the real server over an in-memory transport; scans run for real.
describe('MCP server', () => {
  const client = new Client({ name: 'test', version: '0.0.0' });

  beforeAll(async () => {
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await Promise.all([createServer().connect(serverSide), client.connect(clientSide)]);
  });
  afterAll(() => client.close());

  const call = async (name: string, args: Record<string, unknown>) => {
    const result = await client.callTool({ name, arguments: args });
    const [first, ...rest] = result.content as { text: string }[];
    return { isError: result.isError, text: first?.text ?? '', warnings: rest.map((b) => b.text) };
  };

  it('lists scan_page and explain_rule', async () => {
    const { tools } = await client.listTools();

    expect(tools.map((t) => t.name).sort()).toEqual(['explain_rule', 'scan_page']);
  });

  it('scan_page returns structured findings for a bad page', async () => {
    const { isError, text } = await call('scan_page', { target: fixture('bad.html') });

    expect(isError).toBeFalsy();
    expect(JSON.parse(text)).toEqual(
      expect.arrayContaining([expect.objectContaining({ engine: 'web', ruleId: 'image-alt' })]),
    );
  });

  it('scan_page returns source findings with file and line', async () => {
    const { text } = await call('scan_page', { target: fixture('source/web') });

    expect(JSON.parse(text)).toEqual(
      expect.arrayContaining([expect.objectContaining({ engine: 'source', ruleId: 'jsx-a11y/alt-text', line: 4 })]),
    );
  });

  it('scan_page scans only the listed files', async () => {
    const { text } = await call('scan_page', { target: [fixture('mixed/Widget.tsx'), fixture('mixed/page.html')] });

    expect(JSON.parse(text).map((f: { file: string }) => f.file.split('/').pop()).sort()).toEqual(['Widget.tsx', 'page.html']);
  });

  it('scan_page returns a skipped-files warning after the findings instead of a clean result', async () => {
    const { text, warnings } = await call('scan_page', { target: fixture('unlinted') });

    expect(JSON.parse(text)).toEqual([]);
    expect(warnings).toEqual([expect.stringContaining('Warning: Skipped files with no source rules')]);
  });

  it('scan_page reports an unsupported target as a tool error', async () => {
    const { isError, text } = await call('scan_page', { target: 'nope-not-a-thing' });

    expect(isError).toBe(true);
    expect(text).toContain('Unsupported target');
  });

  it('explain_rule gives the fix hint and WCAG tags', async () => {
    const { text } = await call('explain_rule', { ruleId: 'image-alt' });

    expect(JSON.parse(text)).toMatchObject({ ruleId: 'image-alt', wcag: expect.arrayContaining(['wcag111']) });
    expect(text).toContain('Add alt=');
  });

  it('explain_rule rejects an unknown rule', async () => {
    const { isError, text } = await call('explain_rule', { ruleId: 'made-up' });

    expect(isError).toBe(true);
    expect(text).toContain('Unknown axe rule');
  });
});
