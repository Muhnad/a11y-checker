import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { scan } from '../../../src/index.js';
import { fixture } from '../../helpers.js';

describe('scan (several URLs)', () => {
  const pages: Record<string, string> = {
    '/good': readFileSync(fixture('html/good.html'), 'utf8'),
    '/bad': readFileSync(fixture('html/bad.html'), 'utf8'),
  };
  const server = createServer((req, res) => res.end(pages[req.url ?? ''] ?? ''));
  let base: string;
  beforeAll(async () => {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => server.close());

  it('tells which page each finding came from', async () => {
    const findings = await scan([`${base}/good`, `${base}/bad`]);

    expect(findings.length).toBeGreaterThan(0);
    expect(new Set(findings.map((f) => f.url))).toEqual(new Set([`${base}/bad`]));
  });
});
