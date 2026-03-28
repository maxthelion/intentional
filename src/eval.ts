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

import { writeFile, mkdir, readdir, rename, readFile } from "fs/promises";
import { join } from "path";
import { findPendingSessions, getRollingWindow } from "./inbox";
import { countStagingProposals } from "./staging";
import { GENERATION_ORDER } from "./generation-config";
import type { NextAction, WriteProposal, SpecialistProgress } from "./types";

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
const STAGING_DRY_RUN = join(process.cwd(), "state", "staging", "dry-run");
const WIKI_PAGES = join(process.cwd(), "wiki", "pages");
const SPECIALIST_PROGRESS_PATH = join(process.cwd(), "state", "specialist-progress.json");

/**
 * Find the oldest unapplied proposal in dry-run/.
 * Returns null if none exist or all are discards.
 */
async function findNextProposal(): Promise<{ path: string; proposal: WriteProposal } | null> {
  let files: string[];
  try {
    files = await readdir(STAGING_DRY_RUN);
  } catch {
    return null;
  }

  const proposals = files.filter((f) => f.endsWith(".json")).sort();
  for (const file of proposals) {
    const filePath = join(STAGING_DRY_RUN, file);
    try {
      const proposal = JSON.parse(await readFile(filePath, "utf-8")) as WriteProposal;
      if (proposal.type === "discard") continue; // skip discards
      return { path: filePath, proposal };
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Find the session archive file for a given session_id.
 */
async function findSessionArchive(session_id: string): Promise<string | null> {
  try {
    const files = await readdir(INBOX_DONE);
    const match = files.find((f) => f.includes(session_id) && f.endsWith(".jsonl"));
    return match ? join(INBOX_DONE, match) : null;
  } catch {
    return null;
  }
}

/**
 * Find the wiki page path for a given section slug.
 * Returns null if the page doesn't exist yet.
 */
async function findWikiPage(section: string): Promise<string | null> {
  const pagePath = join(WIKI_PAGES, `${section}.md`);
  try {
    await readFile(pagePath, "utf-8");
    return pagePath;
  } catch {
    return null;
  }
}

async function loadSpecialistProgress(): Promise<SpecialistProgress | null> {
  try {
    return JSON.parse(await readFile(SPECIALIST_PROGRESS_PATH, "utf-8"));
  } catch {
    return null;
  }
}

async function findNextSpecialistLevel(progress: SpecialistProgress): Promise<NextAction | null> {
  const completed = new Set(progress.completed);
  const next = GENERATION_ORDER.find((l) => !completed.has(l.category));
  if (!next) return null;
  return {
    type: "specialist",
    category: next.category,
    role: next.role,
    context_categories: next.contextFrom,
  };
}

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

  // 2. Apply unapplied proposals (before classifying or running next specialist)
  const next = await findNextProposal();
  if (next) {
    const currentPage = await findWikiPage(next.proposal.section);
    const sessionArchive = await findSessionArchive(next.proposal.provenance.session_id);
    return {
      type: "apply",
      proposal_path: next.path,
      proposal: next.proposal,
      current_page_path: currentPage,
      session_path: sessionArchive ?? "",
    };
  }

  // 3. Run next specialist level if in specialist mode
  const progress = await loadSpecialistProgress();
  if (progress?.mode === "specialist") {
    const specialistAction = await findNextSpecialistLevel(progress);
    if (specialistAction) return specialistAction;
    // All levels done — exit specialist mode
    await writeFile(SPECIALIST_PROGRESS_PATH, JSON.stringify({ ...progress, mode: null }, null, 2));
  }

  // 4. Find oldest session with unprocessed pairs
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
  } else if (action.type === "apply") {
    console.log(`✍️  apply — ${action.proposal.type} → ${action.proposal.section} (topic: ${action.proposal.topic})`);
    console.log(`   proposal: ${action.proposal_path}`);
    console.log(`   page: ${action.current_page_path ?? "(new page)"}`);
  } else if (action.type === "specialist") {
    console.log(`🎭 specialist — ${action.role} (${action.category})`);
    console.log(`   context from: ${action.context_categories.join(", ") || "none"}`);
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
