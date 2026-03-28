---
title: Conflict Resolution Logic
category: algorithms
tags: [resolution, recency, conflicts]
summary: How conflicting proposals are resolved — recency wins, superseded proposals archived.
last-modified-by: agent
---

## Recency-Based Conflict Resolution

When two proposals address the same topic, the later seq (or later session) wins. This is mostly deterministic: group proposals by section and topic, compare seq numbers, keep the most recent. Superseded proposals are archived, not deleted. The algorithm reflects the principle that later statements in a conversation supersede earlier ones on the same subject. [[source:811302f6-0be7-435c-b844-910cc9a21b67/27]]
