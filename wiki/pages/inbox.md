---
title: Inbox
category: data-model
tags: [inbox, jsonl, pending, done, message-pair, capture, session]
summary: "The lossless capture layer — JSONL session files written by pi, auto-synced to pending/ by the eval script, moved to done/ when fully triaged. Raw conversations are never modified."
last-modified-by: agent
---

## Directory Structure

```
.pi/inbox/
  {timestamp}-{session_id}.jsonl   ← pi writes here (flat)
  pending/                          ← eval syncs flat files here
    {timestamp}-{session_id}.jsonl
  done/                             ← triage moves sessions here when complete
    {timestamp}-{session_id}.jsonl
```

Pi writes session files to the flat root. The eval script automatically migrates them to `pending/` before scanning. The directory is the status — no flag scanning required.

[[source:811302f6/4]] [[source:811302f6/36]]

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
| `agent` | Full agent turn text. |
| `user` | Full user turn text. |
| `processed` | Set to `true` when the triage tree has completed for this pair. |

[[source:811302f6/10]]

## Why Session-Per-File

The conversation is the atomic unit of truth. Splitting into per-pair files would destroy the cross-pair context that triage requires — corrections and ratifications can only be classified correctly with prior pairs in view. The triage tree loads context once per session and processes pairs in order.

[[source:811302f6/5]] [[source:811302f6/11]]

## Why Pending/Done

The directory is the status. A processor lists `pending/`, processes, and moves files to `done/` atomically with `mv`. No flag scanning, no rewriting, no race conditions. `done/` is kept indefinitely — it is the immutable raw record.

[[source:811302f6/4]]

## The Processed Flag

The `processed` flag on each pair provides finer-grained idempotency within a session. If triage is interrupted after pairs 1–3, pairs 4–N are still `false` and will be retried. The session stays in `pending/` until all pairs are `true`, then moves to `done/`.

[[source:811302f6/10]]

## Invariants

- A session file is **never modified** after moving to `done/`. The raw signal is immutable.
- The `session_id` field must appear in the provenance of every wiki write derived from this session.
- If the triage tree crashes mid-session, unprocessed pairs are retried on the next tick.
- The `done/` archive must never be deleted. It is the ground truth for all provenance traces.

## Sessions Spanning Multiple Days

When a session crosses midnight, pi creates a new file with today's date prefix but the same `session_id`. The eval script handles this by merging pairs from all files with the same `session_id` before processing.

## Related Pages

- [[intent-pipeline]] — where the inbox sits in the full pipeline
- [[triage-behaviour-tree]] — what processes inbox pairs
- [[write-proposals]] — the output produced from inbox pairs
