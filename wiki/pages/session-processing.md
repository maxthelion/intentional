---
title: Session Processing
category: pipeline
tags: [session, processing, migration]
summary: How sessions are processed — ordering, pair-level tracking, and auto-migration from flat inbox.
last-modified-by: agent
---

## Inbox Auto-Migration

The eval script automatically moves flat JSONL files from `.pi/inbox/` into `pending/` before scanning. This handles the case where the pi capture tool writes to the flat inbox location rather than directly to `pending/`. The migration is transparent — no manual file movement is needed. [[source:811302f6-0be7-435c-b844-910cc9a21b67/36]]
