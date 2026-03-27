/**
 * Clear all wiki pages except category-taxonomy.md (structural metadata).
 * Run before a fresh triage pass to let the agent rebuild from scratch.
 *
 * Usage: bun src/reset-wiki.ts
 */

import { readdir, unlink } from "fs/promises";
import { join } from "path";

const WIKI_PAGES = join(process.cwd(), "wiki", "pages");
const PRESERVE = new Set(["category-taxonomy.md"]);

async function main() {
  const files = await readdir(WIKI_PAGES).catch(() => [] as string[]);
  const toDelete = files.filter((f) => f.endsWith(".md") && !PRESERVE.has(f));

  if (toDelete.length === 0) {
    console.log("Wiki already empty.");
    return;
  }

  for (const file of toDelete) {
    await unlink(join(WIKI_PAGES, file));
    console.log(`  deleted ${file}`);
  }

  console.log(`\n✓ Cleared ${toDelete.length} wiki page(s). Ready for fresh triage pass.`);
}

main().catch((err) => {
  console.error("reset-wiki failed:", err);
  process.exit(1);
});
