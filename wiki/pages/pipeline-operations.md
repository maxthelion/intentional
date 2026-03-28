---
title: Pipeline Operations
category: functionality
tags: [pipeline, reset, reproducibility]
summary: How the pipeline supports reproducible runs and fresh rebuilds.
last-modified-by: agent
---

## Reproducible Pipeline Runs

The pipeline should support re-running with blank output so that proposals can be recreated from scratch. Proposals are derived output, not source of truth. A reset clears the wiki and moves sessions back to pending, allowing a full fresh run. This enables iterating on the pipeline itself without accumulating stale state. [[source:811302f6-0be7-435c-b844-910cc9a21b67/26]]
