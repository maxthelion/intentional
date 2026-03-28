---
title: Session Processing
category: pipeline
tags: [session, processing, migration]
summary: How sessions are processed — ordering, pair-level tracking, and auto-migration from flat inbox.
last-modified-by: agent
---

## Inbox Auto-Migration

The eval script automatically moves flat JSONL files from `.pi/inbox/` into `pending/` before scanning. This handles the case where the pi capture tool writes to the flat inbox location rather than directly to `pending/`. The migration is transparent — no manual file movement is needed. [[source:811302f6-0be7-435c-b844-910cc9a21b67/36]]

## Session Processing Order

The evaluator scans `pending/` for sessions with unprocessed pairs and finds the oldest unprocessed pair (`processed: false`). After the agent processes a pair, the processed flag is flipped to true. When all pairs in a session are processed, the session file moves from `pending/` to `done/`. Processing is sequential — oldest pair first — to maintain chronological consistency for correction detection. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]
