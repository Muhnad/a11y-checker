import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright';
import { toFindings } from './normalize.js';
import type { Finding } from './types.js';

export type WebTarget = { url: string } | { html: string };

export interface WebOptions {
  /** axe tag filter, e.g. ['wcag2aa', 'wcag22aa']. Default: all axe rules. */
  tags?: string[];
  viewport?: { width: number; height: number };
  /** CSS selector to wait for before auditing (for client-rendered apps). */
  waitFor?: string;
}

export async function scanWeb(target: WebTarget, opts: WebOptions = {}): Promise<Finding[]> {
  const browser = await chromium.launch();
  try {
    const page = await (await browser.newContext({ viewport: opts.viewport })).newPage();
    if ('url' in target) await page.goto(target.url, { waitUntil: 'load' });
    else await page.setContent(target.html);
    if (opts.waitFor) await page.waitForSelector(opts.waitFor);

    let axe = new AxeBuilder({ page });
    if (opts.tags?.length) axe = axe.withTags(opts.tags);
    return toFindings((await axe.analyze()).violations);
  } finally {
    await browser.close();
  }
}
