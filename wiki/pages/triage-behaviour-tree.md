---
title: Triage Behaviour Tree
category: architecture
tags: [behaviour-tree, triage, classification, signal-detection, write-proposal, dry-run]
summary: "A structured decision process that runs against each inbox message pair, classifies the signal type, and either proposes a write to Octowiki or discards — without ever writing directly."
last-modified-by: agent
---

## What It Is

The triage behaviour tree is not a traditional game-AI behaviour tree. It is closer to the robotics application: a structured decision process that runs to completion on a single unit of work (a message pair) and either produces an output or doesn't.

The tree metaphor earns its place because the decision logic is genuinely hierarchical and failure/success propagation gives clean short-circuit behaviour — if the project cannot be identified, nothing downstream runs, expressed naturally in the tree rather than as nested conditionals.

## Inputs and Outputs

**Inputs:** A message pair (agent turn, user turn, repo path, timestamp, session context)  
**Outputs:** One of — write proposal to staging area, append to questions log, append to rejected directions, discard

## Tree Structure

```
Root (Sequence)
├── LoadProjectContext
│   ├── ReadOctowiki(relevant sections)
│   └── ReadRecentDecisions(last N entries)
├── PairAnalysis (Sequence)
│   ├── DetectRatification   — did user confirm agent's proposal?
│   ├── DetectDecision       — was something concluded?
│   ├── DetectRejection      — was a direction ruled out with reasoning?
│   ├── DetectOpenQuestion   — was something flagged as unresolved?
│   └── DetectClarification  — did something fuzzy become precise?
├── ActOnSignals (collects all detected signals, produces N proposals)
│   ├── [Decision or Ratification] → ProposeWikiWrite (one per detected decision)
│   ├── [Rejection]                → ProposeWikiWrite(rejected_directions)
│   ├── [OpenQuestion]             → AppendToQuestions
│   ├── [Clarification]            → UpdateProjectSummary
│   └── [no signals detected]      → Discard
└── MarkProcessed
```

## Key Design Principles

### Separation of Detection from Action

Condition nodes only classify — they never write. This enables **dry-run mode**: run the tree against historical inbox data and see what it would have done without touching Octowiki. This is how classifiers are tuned: run against a labelled characterisation dataset, compare proposed writes against expected output, adjust thresholds.

### Specialist Loading

A generalist asked "is this a decision?" will say yes to too many things. A specialist loaded with the current Octowiki state can ask the more useful question: "does this change what we already know?" The answer is usually no — most conversation confirms existing understanding rather than changing it. The specialist context is what makes the classifier conservative by default.

### Ratification Is Structurally Different

A decision can appear in a single agent turn. Ratification requires the pair — the agent turn contains the substance, the user turn is the confirmation signal.

For ratification: the classifier extracts what was being proposed from the agent turn, then checks the user turn for confirmation. The output records what the agent proposed, not what the user said.

```json
{
  "type": "ratification",
  "provenance": {
    "raw_agent": "So the inbox should use pending/done at session level...",
    "raw_user": "yes",
    "what_was_ratified": "Inbox uses pending/done at session level with pair-level processed flag"
  }
}
```

`raw_user: "yes"` is almost useless as audit trail. `what_was_ratified` is the substance.

### Rolling Window Context

The tree carries a small window of recent pairs into PairAnalysis. A user turn that corrects a prior agent claim ("I didn't confirm the stack") can only be classified correctly if the classifier knows what the agent claimed in the previous pair. Without the window, it would be classified as a rejection rather than an epistemic correction.

### Write Proposals Are Structured Objects

The tree never mutates Octowiki directly. It produces a structured proposal:

```json
{
  "type": "decision",
  "project": "intentional",
  "section": "inbox",
  "content": "...",
  "confidence": 0.85,
  "provenance": {
    "session_id": "811302f6-...",
    "seq": 4,
    "raw_agent": "...",
    "raw_user": "I think pending and done might be best"
  }
}
```

A separate write node executes the proposal. Failures at the write step do not corrupt the classification result.

### Staging and Auto-Commit

Proposals sit in a staging area. Above a confidence threshold they auto-commit to Octowiki. Below it they go to the triage queue for human review. The threshold starts conservative — ratifications and explicit decisions only — and expands as the classifier earns trust on real data.

### Data-Driven Configuration

Signal types, confidence thresholds, and section mappings live in config, not in the tree implementation. Adding a new signal type is a config change, not a code change.

## Failure Handling

| Failure | Behaviour |
|---|---|
| Octowiki read fails | Abort, re-queue the pair. Don't process without context. |
| Classifier returns ambiguous | Route to triage queue. Don't discard. |
| Write fails | Pair stays unprocessed, retried next tick. |
| Tree crashes | Inbox entry stays `processed: false`, picked up next tick. |

## Invariants

- A pair is processed exactly once. `processed: true` means fully analysed — not that only one signal was found.
- A single pair may produce N proposals (e.g. a spec-drop message pair containing multiple distinct decisions).
- A failed classification never writes anything.
- The tree never mutates Octowiki directly — it proposes, a separate node executes.
- Every write carries provenance: session ID, seq, raw agent turn, raw user turn.

## Context Loading

Context is loaded once per session, not per pair. All pairs in a session share a consistent Octowiki snapshot. Reloading per pair would be expensive and unnecessary — pairs within a session are in the same conversation and share context.

## Related Pages

- [[inbox]] — the input format the tree processes
- [[intent-pipeline]] — where triage sits in the full pipeline
- [[write-proposals]] — the staging area and auto-commit logic
