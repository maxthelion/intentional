/**
 * Mark a pair as processed in the JSONL session file.
 * If all pairs in the session are now processed, move the file to done/.
 *
 * Usage: bun src/mark-processed.ts --session <session_id> --seq <seq>
 */

import { readFile, writeFile, rename, mkdir } from "fs/promises";
import { join, dirname, basename } from "path";
import type { MessagePair } from "./types";

const INBOX_PENDING = join(process.cwd(), ".pi", "inbox", "pending");
const INBOX_DONE = join(process.cwd(), ".pi", "inbox", "done");

function parseArgs(): { session_id: string; seq: number } {
  const args = process.argv.slice(2);
  const sessionIdx = args.indexOf("--session");
  const seqIdx = args.indexOf("--seq");

  if (sessionIdx === -1 || seqIdx === -1) {
    console.error("Usage: bun src/mark-processed.ts --session <session_id> --seq <seq>");
    process.exit(1);
  }

  return {
    session_id: args[sessionIdx + 1],
    seq: parseInt(args[seqIdx + 1], 10),
  };
}

async function findSessionFile(session_id: string): Promise<string | null> {
  const { readdir } = await import("fs/promises");
  const files = await readdir(INBOX_PENDING);
  const match = files.find((f) => f.includes(session_id) && f.endsWith(".jsonl"));
  return match ? join(INBOX_PENDING, match) : null;
}

async function main() {
  const { session_id, seq } = parseArgs();

  const filePath = await findSessionFile(session_id);
  if (!filePath) {
    console.error(`Session file not found for session_id: ${session_id}`);
    process.exit(1);
  }

  // Parse all lines
  const raw = await readFile(filePath, "utf-8");
  const lines = raw.split("\n");
  const updatedLines: string[] = [];
  let found = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      updatedLines.push(line);
      continue;
    }
    try {
      const pair = JSON.parse(trimmed) as MessagePair;
      if (pair.seq === seq) {
        pair.processed = true;
        found = true;
        updatedLines.push(JSON.stringify(pair));
      } else {
        updatedLines.push(line);
      }
    } catch {
      updatedLines.push(line);
    }
  }

  if (!found) {
    console.error(`Pair seq=${seq} not found in session ${session_id}`);
    process.exit(1);
  }

  await writeFile(filePath, updatedLines.join("\n"));
  console.log(`✓ Marked seq=${seq} as processed in session ${session_id}`);

  // Check if all pairs are now processed
  const allPairs: MessagePair[] = [];
  for (const line of updatedLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      allPairs.push(JSON.parse(trimmed) as MessagePair);
    } catch {}
  }

  const allProcessed = allPairs.length > 0 && allPairs.every((p) => p.processed);
  if (allProcessed) {
    await mkdir(INBOX_DONE, { recursive: true });
    const destPath = join(INBOX_DONE, basename(filePath));
    await rename(filePath, destPath);
    console.log(`✓ Session complete — moved to done/`);
  } else {
    const remaining = allPairs.filter((p) => !p.processed).length;
    console.log(`  ${remaining} pair(s) remaining in session`);
  }
}

main().catch((err) => {
  console.error("mark-processed failed:", err);
  process.exit(1);
});
