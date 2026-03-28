---
title: Intent Pipeline
category: pipeline
tags: [pipeline, triage, resolution, octowiki, characterisation, traceability]
summary: "The transformation chain from raw conversation to structured wiki: logging → triage → resolution → application. Each stage has a single responsibility."
last-modified-by: agent
---

## Overview

```
Conversation → Inbox (pending/) → Triage → Resolution → Application → Octowiki → Characterisation Tests
```

Each stage is a transformation with a single responsibility. No stage does the work of another.

[[source:811302f6/5]]

## Stage 1 — Logging (Inbox)

**Responsibility:** Lossless capture. No judgement, no filtering, no transformation.

Every conversation is written to `.pi/inbox/` as a JSONL file by the pi agent. The eval script automatically migrates these files into `pending/` before scanning. Each line is a message pair (agent turn + user turn). The file is never modified after capture. If a session is interrupted, the partial file is valid — unprocessed pairs are retried.

**Input:** Live conversation
**Output:** `.pi/inbox/pending/{timestamp}-{session_id}.jsonl`
**Invariant:** Nothing is lost. The raw signal is always recoverable.

[[source:811302f6/5]] [[source:811302f6/36]]

## Stage 2 — Triage (Classification)

**Responsibility:** Signal extraction. Decisions, rejections, open questions separated from noise.

A behaviour tree runs against each unprocessed message pair, loads the current Octowiki context as a specialist, and classifies the pair. A single pair may produce multiple proposals — a spec-drop pair can contain several distinct decisions. Each proposal is a structured JSON object written to `state/staging/dry-run/`.

When a session is fully processed, its file moves from `pending/` to `done/`.

**Input:** Message pair + Octowiki context
**Output:** N write proposals (structured JSON) or discard
**Invariant:** A pair is processed exactly once. A failed classification never writes anything.

See [[triage-behaviour-tree]] for the full decision logic.

[[source:811302f6/10]] [[source:811302f6/13]]

## Stage 3 — Resolution

**Responsibility:** Conflict detection and recency-based consolidation.

Raw proposals from triage may conflict — if the conversation says "A is blue" and later "A is red", both proposals exist. Resolution detects conflicts by grouping proposals by `topic`, applies recency (higher seq wins within a session, later session wins across sessions), and marks superseded proposals. Resolved proposals are written to `state/staging/resolved/`.

Resolution is agentic — it reads proposals alongside the original conversation pairs (via provenance) so it can reason about intent, not just the extracted text.

**Input:** Raw proposals from dry-run/ + original session pairs (for lookback)
**Output:** Consolidated proposals in resolved/
**Invariant:** Superseded proposals are marked but preserved — provenance is never destroyed.

[[source:811302f6/27]]

## Stage 4 — Application

**Responsibility:** Writing resolved proposals to Octowiki.

An agent reads each resolved proposal in chronological order and applies it to the relevant wiki page — creating the page if it doesn't exist, updating it if it does. Each written claim includes a citation (`[[source:session_id/seq]]`) so the provenance chain is visible in the wiki itself.

Application is agentic and can look up original conversation pairs via provenance when it needs more context than the proposal provides.

**Input:** Resolved proposals + original session pairs
**Output:** Updated wiki pages with inline citations
**Invariant:** Every wiki claim has a citation. Every citation is traceable to an immutable inbox record.

[[source:811302f6/25]]

## Stage 5 — Characterisation Tests

**Responsibility:** Freezing implied behaviour as executable tests.

For every invariant declared in Octowiki, a characterisation test is derived. The test encodes what "correct" looks like in runnable form. Tests are derived by agents from the spec — humans do not write them.

**Input:** Invariants from Octowiki
**Output:** Test suite in the project under test
**Invariant:** Every test traces back to a specific Octowiki entry.

[[source:811302f6/5]]

## Traceability Chain

```
Characterisation test
  → Octowiki entry (with [[source:session_id/seq]] citation)
    → Write proposal (confidence, type, topic)
      → Message pair (session_id, seq)
        → Raw inbox log (.pi/inbox/done/ — immutable)
```

## What Is Not In This Pipeline

- **CodeHealth** — checking whether invariants are met in code is a separate concern, handled by octowiki invariants. [[source:811302f6/17]]
- **Work item generation** — identifying what to build next from the spec delta is downstream of this pipeline, handled by the agent loop.
- **Code generation** — intentional produces the specification; code is derived from it elsewhere.

## Related Pages

- [[inbox]] — inbox format and pending/done structure
- [[triage-behaviour-tree]] — how classification works
- [[write-proposals]] — proposal format, staging, and resolution
- [[overview]] — why the pipeline exists
