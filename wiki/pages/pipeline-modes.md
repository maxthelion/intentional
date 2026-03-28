---
title: Pipeline Modes
category: pipeline
tags: [dry-run, live, reset]
summary: Dry-run vs live mode, and how to reset for fresh runs.
last-modified-by: agent
---

## Dry-Run vs Live Mode

Dry-run means the write node is a no-op — classification runs and proposals are written to `staging/dry-run/` instead of being applied. In live mode, proposals go to `staging/pending/` for auto-commit to the wiki. The distinction is a flag, not a separate pipeline. You can inspect every proposal in dry-run and see exactly what the tree would have done before trusting it to run live. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]
