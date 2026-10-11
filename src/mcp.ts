import axe from 'axe-core';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FIX_HINTS } from './normalize.js';
import { scan } from './scan.js';

const block = (value: unknown) => ({
  type: 'text' as const,
  text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
});
const text = (value: unknown, isError = false, warnings: string[] = []) => ({
  content: [block(value), ...warnings.map((w) => block(`Warning: ${w}`))],
  isError,
});

export function createServer(): McpServer {
  const server = new McpServer({ name: 'a11y-checker', version: '3.0.0' });

  server.registerTool(
    'scan_page',
    {
      description:
        'Scan for accessibility problems and return structured findings. target is a URL, an HTML file or string (rendered in Chromium with axe-core), or a source file/directory (React, Next.js, React Native, Angular templates, HTML; linted). Pass only the files or directories the user asked about. Each finding has ruleId, impact, fixHint and a selector (web) or file and line (source).',
      inputSchema: {
        target: z
          .union([z.string(), z.array(z.string()).min(1)])
          .describe('URL, file or directory path, or an HTML string; or a list of them to scan only those'),
        tags: z.array(z.string()).optional().describe('axe tags, e.g. ["wcag2aa","wcag22aa"]; web targets only'),
        waitFor: z.string().optional().describe('CSS selector to wait for before scanning; web targets only'),
      },
    },
    async ({ target, tags, waitFor }) => {
      const warnings: string[] = [];
      try {
        // The findings are always the first content block; warnings follow as plain text.
        return text(await scan(target, { tags, waitFor, onWarning: (w) => warnings.push(w) }), false, warnings);
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
