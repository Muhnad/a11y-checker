import axe from 'axe-core';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FIX_HINTS } from './normalize.js';
import { scan } from './scan.js';

const text = (value: unknown, isError = false) => ({
  content: [{ type: 'text' as const, text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
  isError,
});

export function createServer(): McpServer {
  const server = new McpServer({ name: 'a11y-checker', version: '3.0.0' });

  server.registerTool(
    'scan_page',
    {
      description:
        'Scan for accessibility problems and return structured findings. target is a URL, an HTML file or string (rendered in Chromium with axe-core), or a source file/directory (React, Next.js, React Native; linted). Each finding has ruleId, impact, fixHint and a selector (web) or file and line (source).',
      inputSchema: {
        target: z.string().describe('URL, file or directory path, or an HTML string'),
        tags: z.array(z.string()).optional().describe('axe tags, e.g. ["wcag2aa","wcag22aa"]; web targets only'),
        waitFor: z.string().optional().describe('CSS selector to wait for before scanning; web targets only'),
      },
    },
    async ({ target, tags, waitFor }) => {
      try {
        return text(await scan(target, { tags, waitFor }));
      } catch (e) {
        return text(e instanceof Error ? e.message : String(e), true);
      }
    },
  );

  server.registerTool(
    'explain_rule',
    {
      description: 'Explain an axe-core rule id from a web finding: what it checks, how to fix it, WCAG tags and docs link.',
      inputSchema: { ruleId: z.string().describe('axe rule id, e.g. "image-alt"') },
    },
    async ({ ruleId }) => {
      const rule = axe.getRules().find((r) => r.ruleId === ruleId);
      // ponytail: axe rules only; source findings (jsx-a11y/*) carry their message and docs link already.
      if (!rule) return text(`Unknown axe rule "${ruleId}".`, true);
      return text({
        ruleId,
        description: rule.description,
        fixHint: FIX_HINTS[ruleId] ?? rule.help,
        wcag: rule.tags.filter((t) => t.startsWith('wcag')),
        helpUrl: rule.helpUrl,
      });
    },
  );

  return server;
}
