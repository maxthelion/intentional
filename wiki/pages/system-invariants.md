---
title: System Invariants
category: testing
tags: [invariants, correctness, testing]
summary: Invariants that must always hold — archive immutability, provenance completeness, agent boundaries, idempotency.
last-modified-by: agent
---

## Invariant: Classification Agent Has No Side Effects Beyond Proposals

The classification agent must produce only proposals written to `state/staging/dry-run/`. It must not commit, push, or perform any other git operations. It must not modify the wiki directly. Writing proposals to staging is the only permitted side effect. An agent that commits or pushes during classification is violating the pure function boundary. [[source:811302f6-0be7-435c-b844-910cc9a21b67/24]]

## Invariant: Done Archive Is Immutable

Files in `done/` must never be modified after they are moved there. Raw capture is lossless and immutable — only derived artifacts change. Any test that detects modification of a `done/` file indicates a pipeline violation. [[source:811302f6-0be7-435c-b844-910cc9a21b67/5]]

## Invariant: Reprocessing Is Idempotent

Reprocessing a session must skip pairs where `processed: true`. A full reset (moving sessions back to pending, clearing processed flags) must produce the same proposals as the initial run — proposals are derived output, not source of truth, and must be reproducible from the raw conversations alone. [[source:811302f6-0be7-435c-b844-910cc9a21b67/26]]

## Invariant: Every Wiki Claim Has Provenance

Every piece of content in the wiki must end with a `[[source:session_id/seq]]` citation. Every proposal must include full provenance: `session_id`, `seq`, `raw_agent`, `raw_user`. The provenance chain from wiki claim back to raw conversation must never be broken. A wiki page without citations indicates a pipeline bypass. [[source:811302f6-0be7-435c-b844-910cc9a21b67/28]]
