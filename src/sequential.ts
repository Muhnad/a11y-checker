/** Run `task` on each item one after another (each web scan launches its own browser) and concatenate the results. */
export async function flatMapSequentially<T, R>(items: T[], task: (item: T) => Promise<R[]>): Promise<R[]> {
  const results: R[] = [];
  for (const item of items) results.push(...(await task(item)));
  return results;
}
