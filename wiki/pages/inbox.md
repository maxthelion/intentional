---
title: Inbox
category: functionality
tags: [inbox, capture, jsonl]
summary: The inbox captures conversations losslessly using pending/done directories and JSONL format.
last-modified-by: agent
---

## Inbox Capture

The inbox uses a `pending/` and `done/` directory structure. One file per conversation session, in JSONL format. The directory location is the status — no scanning for processed flags across files. A processor lists `pending/`, picks up a file, processes it, and moves it to `done/`. The `done/` archive is immutable — raw capture is lossless and never modified. [[source:811302f6-0be7-435c-b844-910cc9a21b67/4]]
