/**
 * Mark a specialist level as complete after the agent has produced proposals.
 * Call this after running specialist-prompt and writing all proposals.
 *
 * Usage: bun src/specialist-complete.ts --category functionality
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { SpecialistProgress } from "./types";

const PROGRESS_PATH = join(process.cwd(), "state", "specialist-progress.json");

async function main() {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--category");
  if (idx === -1) {
    console.error("Usage: bun src/specialist-complete.ts --category <category>");
    process.exit(1);
  }
  const category = args[idx + 1];

  let progress: SpecialistProgress;
  try {
    progress = JSON.parse(await readFile(PROGRESS_PATH, "utf-8"));
  } catch {
    progress = { completed: [], mode: "specialist" };
  }

  if (!progress.completed.includes(category)) {
    progress.completed.push(category);
  }

  await writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
  console.log(`✓ Marked ${category} complete. Completed: ${progress.completed.join(", ")}`);
}

main().catch((err) => {
  console.error("specialist-complete failed:", err);
  process.exit(1);
});
