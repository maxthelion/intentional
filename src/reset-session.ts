/**
 * Reset a session for reprocessing — moves it from done/ back to pending/
 * and clears all processed flags.
 *
 * Use this to re-run the classifier against a session after tuning prompts.
 *
 * Usage: bun src/reset-session.ts --session <session_id>
 *        bun src/reset-session.ts --all   (resets all sessions in done/)
 */

import { readFile, writeFile, rename, readdir } from "fs/promises";
import { join, basename } from "path";
import type { MessagePair } from "./types";

const INBOX_PENDING = join(process.cwd(), ".pi", "inbox", "pending");
const INBOX_DONE = join(process.cwd(), ".pi", "inbox", "done");

function parseArgs(): { session_id?: string; all: boolean } {
  const args = process.argv.slice(2);
  const sessionIdx = args.indexOf("--session");
  const all = args.includes("--all");
  return {
    session_id: sessionIdx !== -1 ? args[sessionIdx + 1] : undefined,
    all,
  };
}

async function resetFile(filePath: string, destDir: string): Promise<void> {
  const raw = await readFile(filePath, "utf-8");
  const lines = raw.split("\n");
  const resetLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;
    try {
      const pair = JSON.parse(trimmed) as MessagePair;
      pair.processed = false;
      return JSON.stringify(pair);
    } catch {
      return line;
    }
  });

  const destPath = join(destDir, basename(filePath));
  await writeFile(filePath, resetLines.join("\n"));
  await rename(filePath, destPath);
  console.log(`✓ Reset ${basename(filePath)} → pending/`);
}

async function main() {
  const { session_id, all } = parseArgs();

  if (!session_id && !all) {
    console.error("Usage: bun src/reset-session.ts --session <session_id> | --all");
    process.exit(1);
  }

  const files = await readdir(INBOX_DONE).catch(() => [] as string[]);
  const matches = all
    ? files.filter((f) => f.endsWith(".jsonl"))
    : files.filter((f) => f.includes(session_id!) && f.endsWith(".jsonl"));

  if (matches.length === 0) {
    console.error(`No sessions found in done/ matching: ${session_id ?? "all"}`);
    process.exit(1);
  }

  for (const file of matches) {
    await resetFile(join(INBOX_DONE, file), INBOX_PENDING);
  }
}

main().catch((err) => {
  console.error("reset-session failed:", err);
  process.exit(1);
});
