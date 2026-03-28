---
title: System Invariants
category: testing
tags: [invariants, correctness, testing]
summary: Invariants that must always hold — archive immutability, provenance completeness, agent boundaries, idempotency.
last-modified-by: agent
---

## Invariant: Classification Agent Has No Side Effects Beyond Proposals

The classification agent must produce only proposals written to `state/staging/dry-run/`. It must not commit, push, or perform any other git operations. It must not modify the wiki directly. Writing proposals to staging is the only permitted side effect. An agent that commits or pushes during classification is violating the pure function boundary. [[source:811302f6-0be7-435c-b844-910cc9a21b67/24]]
