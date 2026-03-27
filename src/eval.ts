/**
 * Deterministic tree evaluator — no LLM.
 *
 * Evaluates the triage behaviour tree against current world state
 * and outputs a next-action.json for the agent to act on.
 *
 * Tree:
 *   Selector
 *   ├── [staging proposals awaiting review?] → review-staging
 *   ├── [unprocessed pairs in pending/?]     → classify (oldest first)
 *   └── [always]                             → idle
 */

import { writeFile, mkdir, readdir, rename } from "fs/promises";
import { join } from "path";
import { findPendingSessions, getRollingWindow } from "./inbox";
import { countStagingProposals } from "./staging";
import type { NextAction } from "./types";

const INBOX_ROOT = join(process.cwd(), ".pi", "inbox");
const INBOX_PENDING = join(INBOX_ROOT, "pending");
const INBOX_DONE = join(INBOX_ROOT, "done");

/**
 * Move any flat JSONL files from .pi/inbox/ into pending/.
 * Pi writes session files to the flat inbox root — this syncs them
 * into the pending/ directory so the evaluator can pick them up.
 */
async function syncInbox(): Promise<void> {
  await mkdir(INBOX_PENDING, { recursive: true });
  await mkdir(INBOX_DONE, { recursive: true });

  const files = await readdir(INBOX_ROOT).catch(() => [] as string[]);
  for (const file of files) {
    if (!file.endsWith(".jsonl")) continue;
    const src = join(INBOX_ROOT, file);
    const dest = join(INBOX_PENDING, file);
    const done = join(INBOX_DONE, file);

    // Skip if already in pending/ or done/
    const inPending = await readdir(INBOX_PENDING).then((fs) => fs.includes(file)).catch(() => false);
    const inDone = await readdir(INBOX_DONE).then((fs) => fs.includes(file)).catch(() => false);
    if (inPending || inDone) continue;

    await rename(src, dest);
    console.log(`  synced ${file} → pending/`);
  }
}

const NEXT_ACTION_PATH = join(process.cwd(), "state", "next-action.json");

async function evaluate(): Promise<NextAction> {
  // 1. Staging proposals awaiting review take priority
  const stagingCount = await countStagingProposals();
  if (stagingCount > 0) {
    return {
      type: "review-staging",
      proposal_count: stagingCount,
      staging_path: join(process.cwd(), "state", "staging", "pending"),
    };
  }

  // 2. Find oldest session with unprocessed pairs
  const sessions = await findPendingSessions();
  if (sessions.length === 0) {
    return { type: "idle", reason: "No unprocessed pairs in pending/" };
  }

  const session = sessions[0]; // oldest first
  const nextPair = session.pairs.find((p) => !p.processed);
  if (!nextPair) {
    return { type: "idle", reason: "No unprocessed pairs found" };
  }

  const rolling_window = getRollingWindow(session.pairs, nextPair.seq);

  return {
    type: "classify",
    session_id: session.session_id,
    session_path: session.path,
    seq: nextPair.seq,
    pair: nextPair,
    rolling_window,
  };
}

async function main() {
  await syncInbox();
  const action = await evaluate();
  await mkdir(join(process.cwd(), "state", "staging", "dry-run"), { recursive: true });
  await mkdir(join(process.cwd(), "state", "staging", "pending"), { recursive: true });
  await mkdir(join(process.cwd(), "state", "staging", "done"), { recursive: true });
  await writeFile(NEXT_ACTION_PATH, JSON.stringify(action, null, 2));

  // Human-readable summary to stdout
  if (action.type === "idle") {
    console.log(`⏸  idle — ${action.reason}`);
  } else if (action.type === "review-staging") {
    console.log(`📋 review-staging — ${action.proposal_count} proposal(s) awaiting review`);
  } else {
    console.log(`🔍 classify — session ${action.session_id} seq=${action.seq}`);
    console.log(`   rolling window: ${action.rolling_window.length} prior pair(s)`);
  }

  console.log(`\nWritten to: ${NEXT_ACTION_PATH}`);
}

main().catch((err) => {
  console.error("eval failed:", err);
  process.exit(1);
});
