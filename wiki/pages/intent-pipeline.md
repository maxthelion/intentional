---
title: Intent Pipeline
category: pipeline
tags: [pipeline, triage, octowiki, characterisation, traceability]
summary: "The full transformation chain from raw conversation to enforceable intent: logging → triage → Octowiki → characterisation tests."
last-modified-by: agent
---

## Overview

The pipeline transforms raw conversational signal into structured, enforceable intent. Each stage is a transformation with a single responsibility. No stage does the work of another.

```
Conversations → Inbox (pending/) → Triage → Octowiki → Characterisation Tests
```

## Stages

### 1. Logging (Inbox)

**Responsibility:** Lossless capture. No judgement, no filtering, no transformation.

Every conversation is written to `.pi/inbox/pending/` as a JSONL file. Each line is a message pair (agent turn + user turn). The file is never modified after creation. If a session is interrupted, the partial file is still valid — unprocessed pairs are retried.

**Input:** Live conversation  
**Output:** `pending/{timestamp}-{session_id}.jsonl`  
**Invariant:** Nothing is lost. The raw signal is always recoverable.

### 2. Triage (Behaviour Tree)

**Responsibility:** Signal extraction. Decisions, rejections, open questions separated from noise.

A behaviour tree runs against each unprocessed message pair, loads the current Octowiki context, classifies the pair, and either proposes a write or discards. Write proposals go to a staging area with a confidence score. Above the auto-commit threshold they are applied immediately; below it they go to the triage queue for human review.

When a session is fully processed, its file moves from `pending/` to `done/`.

**Input:** Message pair + Octowiki context  
**Output:** Write proposal (structured) or discard  
**Invariant:** A pair is processed exactly once. A failed classification never writes anything.

See [[triage-behaviour-tree]] for the full decision logic.

### 3. Octowiki

**Responsibility:** Consolidation. The current authoritative statement of what the system is and why.

Octowiki holds the distilled intent as structured markdown pages with frontmatter. It is fractal — pages link to pages, allowing narrow agent context windows. It is the only place where intent is stored authoritatively.

**Input:** Write proposals from triage  
**Output:** Updated wiki pages  
**Invariant:** Every entry carries provenance — session ID, timestamp, the raw pair that triggered it.

### 4. Characterisation Tests

**Responsibility:** Freezing implied behaviour. The executable shadow of Octowiki.

For every invariant declared in Octowiki, a characterisation test is derived. The test encodes what "correct" looks like in runnable form. Tests are derived by agents from the spec; humans do not write them.

**Input:** Invariants from Octowiki  
**Output:** Test suite  
**Invariant:** Every test traces back to a specific Octowiki entry.

## Traceability

The through-line is full provenance at every stage:

```
Characterisation test
  → Octowiki entry (page + section)
    → Write proposal (confidence, type)
      → Message pair (session_id, seq)
        → Raw inbox log (immutable)
```

Any finding can be followed all the way back to the conversation where the underlying decision was made.

## Related Pages

- [[inbox]] — inbox format and pending/done structure
- [[triage-behaviour-tree]] — how triage decisions are made
- [[overview]] — why the pipeline exists
