import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AxeBuilder } from '@axe-core/playwright';
import { chromium, type BrowserContext } from 'playwright';
import { toFindings } from './web-findings.js';
import { flatMapSequentially } from '../sequential.js';
import type { Finding } from '../types.js';

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

const originOf = (target: WebTarget): Pick<Finding, 'file' | 'url'> => {
  if (!('url' in target)) return {};
  return target.url.startsWith('file:') ? { file: relative(process.cwd(), fileURLToPath(target.url)) } : { url: target.url };
};

async function audit(context: BrowserContext, target: WebTarget, { tags, waitFor }: WebOptions): Promise<Finding[]> {
  const page = await context.newPage();
  if ('url' in target) await page.goto(target.url, { waitUntil: 'load' });
  else await page.setContent(target.html);
  if (waitFor) await page.waitForSelector(waitFor);

  const axe = new AxeBuilder({ page });
  const { violations } = await (tags?.length ? axe.withTags(tags) : axe).analyze();
  await page.close();
  return toFindings(violations).map((finding) => ({ ...finding, ...originOf(target) }));
}

/** Scan one or more pages with a single browser. Findings carry `file` for a local file and `url` for any other URL. */
export async function scanWeb(targets: WebTarget | WebTarget[], opts: WebOptions = {}): Promise<Finding[]> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: opts.viewport });
    return await flatMapSequentially([targets].flat(), (target) => audit(context, target, opts));
  } finally {
    await browser.close();
  }
}
