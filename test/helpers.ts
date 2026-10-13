// Shared by the integration tests. Not a test file: vitest only picks up `*.test.ts` and `*.integration-test.ts`.
export const fixture = (path: string) => new URL(`./fixtures/${path}`, import.meta.url).pathname;
export const ruleIds = (findings: { ruleId: string }[]) => findings.map((f) => f.ruleId);
export const bin = new URL('../dist/cli.js', import.meta.url).pathname;
