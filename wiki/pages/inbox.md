---
title: Inbox
category: data-model
tags: [inbox, jsonl, pending, done, message-pair, capture, logging]
summary: "The inbox is the lossless capture layer — JSONL session files in pending/ awaiting triage, moved to done/ when fully processed. Raw conversations are never modified."
last-modified-by: agent
---

## Structure

```
.pi/inbox/
  pending/   ← sessions awaiting triage
  done/      ← fully processed sessions (immutable archive)
```

Sessions live in `pending/` until every pair in them has been processed. When fully processed, the file is moved atomically to `done/`. The directory is the status — no flag scanning required.

## File Format

One file per session, named `{timestamp}-{session_id}.jsonl`. Each line is a message pair:

```json
{
  "session_id": "811302f6-0be7-435c-b844-910cc9a21b67",
  "repo": "/path/to/project",
  "seq": 4,
  "timestamp": "2026-03-27T14:49:52.475Z",
  "agent": "The full agent turn text...",
  "user": "The full user turn text...",
  "processed": false
}
```

### Fields

| Field | Description |
|---|---|
| `session_id` | Stable UUID for the session. The provenance anchor for all downstream artifacts. |
| `repo` | Absolute path to the repo. Used to load the correct Octowiki context. |
| `seq` | Monotonically increasing within the session. Used for ordering and rolling window context. |
| `timestamp` | When the pair was captured. |
| `agent` | The full agent turn text. |
| `user` | The full user turn text. |
| `processed` | Set to `true` when the triage tree has completed for this pair. |

## Invariants

- A session file is **never modified** after it moves to `done/`. The raw signal is immutable.
- A pair's `processed` flag is the idempotency guard — the tree will not reprocess a pair marked `true`.
- If the triage tree crashes mid-session, unprocessed pairs (still `false`) are retried on the next tick.
- The `session_id` field is stable and unique. It must appear in the provenance of every Octowiki write derived from this session.

## Why Session-Per-File

A session file contains one conversation. The conversation is the atomic unit of truth — splitting it into per-message files would destroy the context that makes triage possible. The triage tree loads context once per session and processes pairs in order; pair N can reference pair N-1 for corrections and ratifications.

## Why Pending/Done

The directory is the status. A processor lists `pending/`, picks up files, processes them, and moves them to `done/` atomically with `mv`. No flag scanning, no rewriting files, no race conditions. The `done/` archive is kept indefinitely as the immutable raw record.

## The Processed Flag

The `processed` flag on each pair handles finer-grained idempotency within a session. If the process is interrupted after processing pairs 1–3 but before the session is complete, pairs 4–N are still `false` and will be retried. The session stays in `pending/` until all pairs are `true`, then moves to `done/`.

## Related Pages

- [[intent-pipeline]] — where the inbox sits in the full pipeline
- [[triage-behaviour-tree]] — what processes inbox pairs
