---
title: Resolution Stage
category: pipeline
tags: [resolution, conflicts, recency]
summary: The resolution stage — how conflicting proposals are consolidated using recency rules.
last-modified-by: agent
---

## Resolution Stage Flow

The resolution stage is mostly deterministic. It groups proposals by section and topic. If two proposals address the same thing, the later seq (or later session) wins — the superseded proposal is archived, not deleted. This stage exists because classification and resolution were originally conflated and needed to be separated: one step generates proposals (possibly conflicting), another resolves them. [[source:811302f6-0be7-435c-b844-910cc9a21b67/27]]
