import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright';
import { toFindings } from './normalize.js';
import type { Finding } from './types.js';

export type WebTarget = { url: string } | { html: string };

export interface WebOptions {
  /** Called with notes about what was skipped, so a scan can't look clean by accident. */
  onWarning?: (message: string) => void;
  /** axe tag filter, e.g. ['wcag2aa', 'wcag22aa']. Default: all axe rules. */
  tags?: string[];
  viewport?: { width: number; height: number };
  /** CSS selector to wait for before auditing (for client-rendered apps). */
  waitFor?: string;
}

/** Scan one or more pages with a single browser. Findings from local files carry `file`. */
export async function scanWeb(targets: WebTarget | WebTarget[], opts: WebOptions = {}): Promise<Finding[]> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: opts.viewport });
    const findings: Finding[] = [];
    for (const target of [targets].flat()) {
      const page = await context.newPage();
      if ('url' in target) await page.goto(target.url, { waitUntil: 'load' });
      else await page.setContent(target.html);
      if (opts.waitFor) await page.waitForSelector(opts.waitFor);

      let axe = new AxeBuilder({ page });
      if (opts.tags?.length) axe = axe.withTags(opts.tags);
      const file =
        'url' in target && target.url.startsWith('file:') ? relative(process.cwd(), fileURLToPath(target.url)) : undefined;
      findings.push(...toFindings((await axe.analyze()).violations).map((f) => (file ? { ...f, file } : f)));
      await page.close();
    }
    return findings;
  } finally {
    await browser.close();
  }
}
