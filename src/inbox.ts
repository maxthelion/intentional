import { readdir, readFile } from "fs/promises";
import { join } from "path";
import type { MessagePair, Session } from "./types";

const INBOX_PENDING = join(process.cwd(), ".pi", "inbox", "pending");
const ROLLING_WINDOW_SIZE = 3;

/**
 * Parse a JSONL session file into an ordered array of message pairs.
 */
export async function parseSession(filePath: string): Promise<MessagePair[]> {
  const raw = await readFile(filePath, "utf-8");
  const pairs: MessagePair[] = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      pairs.push(JSON.parse(trimmed) as MessagePair);
    } catch {
      // malformed line — skip, don't abort
    }
  }

  return pairs.sort((a, b) => a.seq - b.seq);
}

/**
 * Find all sessions in pending/ that have at least one unprocessed pair.
 * Returns sessions sorted oldest-first by filename (timestamp prefix).
 */
export async function findPendingSessions(): Promise<Session[]> {
  let files: string[];
  try {
    files = await readdir(INBOX_PENDING);
  } catch {
    return [];
  }

  const sessions: Session[] = [];

  for (const file of files.sort()) {
    if (!file.endsWith(".jsonl")) continue;
    const filePath = join(INBOX_PENDING, file);
    const pairs = await parseSession(filePath);
    const hasUnprocessed = pairs.some((p) => !p.processed);
    if (!hasUnprocessed) continue;

    const session_id = pairs[0]?.session_id ?? file;
    sessions.push({ path: filePath, session_id, pairs });
  }

  return sessions;
}

/**
 * Get the rolling window of prior pairs for a given seq within a session.
 * Used to give the classifier context for correction and ratification detection.
 */
export function getRollingWindow(pairs: MessagePair[], seq: number): MessagePair[] {
  const idx = pairs.findIndex((p) => p.seq === seq);
  if (idx <= 0) return [];
  const start = Math.max(0, idx - ROLLING_WINDOW_SIZE);
  return pairs.slice(start, idx);
}
