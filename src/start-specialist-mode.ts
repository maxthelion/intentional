/**
 * Initialise specialist mode — resets wiki and sets progress to start
 * the ordered specialist generation pipeline from the beginning.
 *
 * Usage: bun src/start-specialist-mode.ts
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { SpecialistProgress } from "./types";

const PROGRESS_PATH = join(process.cwd(), "state", "specialist-progress.json");

async function main() {
  await mkdir(join(process.cwd(), "state"), { recursive: true });
  const progress: SpecialistProgress = { completed: [], mode: "specialist" };
  await writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
  console.log("✓ Specialist mode started. Run bun run eval to begin.");
  console.log("  First level: functionality");
}

main().catch((err) => {
  console.error("start-specialist-mode failed:", err);
  process.exit(1);
});
