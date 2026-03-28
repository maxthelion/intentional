---
title: Inbox Data Format
category: data-model
tags: [jsonl, session, inbox, format]
summary: The JSONL session file format — naming, structure, and per-pair processed flags.
last-modified-by: agent
---

## JSONL Session Format

Session files use JSONL (JSON Lines) format — each message is a separate JSON object on its own line. This means appending is O(1) and a processor can stream line-by-line without loading the whole file. One file per conversation session, not per message, because the conversation is the atomic unit of truth. Splitting into per-message files would destroy the context that makes triage possible. [[source:811302f6-0be7-435c-b844-910cc9a21b67/5]]

## Pair-Level Processed Flag

Each JSONL line (agent/user pair) has a `processed` boolean field. This flag handles retry and idempotency within a session — if processing fails partway through, only unprocessed pairs are retried. The flag is separate from the session-level `pending/done` directory move, which tracks whether the entire session has been consumed. [[source:811302f6-0be7-435c-b844-910cc9a21b67/10]]
