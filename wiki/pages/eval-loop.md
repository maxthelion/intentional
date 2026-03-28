---
title: Eval Loop
category: pipeline
tags: [eval, loop, next-action]
summary: The deterministic eval loop that drives the pipeline — scan, decide, hand off, repeat.
last-modified-by: agent
---

## Eval Loop Flow

The pipeline runs as a deterministic loop: `bun run eval` scans the filesystem and writes `state/next-action.json` describing what to do next. The agent reads the next-action, executes the task (classify a pair, apply a proposal), then eval runs again. The loop repeats until eval returns `idle`. The eval script has no LLM — it is purely filesystem checks producing a structured action. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]
