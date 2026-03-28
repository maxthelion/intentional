---
title: Staging Architecture
category: architecture
tags: [staging, dry-run, write-boundary]
summary: The staging area as the write boundary between classification and wiki application.
last-modified-by: agent
---

## Staging as Write Boundary

Proposals are written to a staging area, never directly to the wiki. The staging area has three directories: `dry-run/` for proposals that are committed on the agent's branch for review, `pending/` for proposals approved for auto-commit, and `done/` for proposals that have been applied. The `dry-run/` vs `pending/` distinction controls whether proposals auto-apply or require human review. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]
