---
title: Behaviour Tree Architecture
category: architecture
tags: [behaviour-tree, orchestration, design-constraints]
summary: The behaviour tree as pipeline orchestrator — its role, tensions, and the evaluator/agent split.
last-modified-by: agent
---

## Behaviour Tree as Pipeline Orchestrator

The behaviour tree is not game AI — it is a stateful, conditional pipeline orchestrator. It must be cheap to idle, intelligent when it fires, conservative about what it writes but not so conservative it misses things, and modular enough to add new signal types without rewriting the core. These tensions are the core architectural constraint. [[source:811302f6-0be7-435c-b844-910cc9a21b67/10]]

## Deterministic Evaluator vs LLM Agent

The system has a clean separation between the deterministic tree evaluator and the LLM agent. The evaluator is a script with no LLM — it scans the filesystem, checks conditions, and outputs a structured next-action file. The agent receives that file and executes one task as a pure function. The evaluator decides what to work on; the agent does not reason about what to do. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]
