---
title: Triage Behaviour Tree
category: architecture
tags: [behaviour-tree, triage, classification, signal-detection, specialist, dry-run]
summary: "A structured decision process that classifies inbox message pairs and produces write proposals — without ever writing to Octowiki directly."
last-modified-by: agent
---

## What It Is

The triage behaviour tree is not a game AI behaviour tree. It is closer to the robotics application: a structured decision process that runs to completion on a single unit of work (a message pair) and either produces proposals or discards.

The tree metaphor earns its place because the decision logic is genuinely hierarchical and failure/success propagation gives clean short-circuit behaviour — if the project cannot be identified, nothing downstream runs, expressed naturally in the tree rather than as nested conditionals.

Inspired by the behaviour tree orchestration pattern described at https://blog.maxthelion.me/blog/behaviour-trees/ — agents as pure functions taking deterministic instructions and producing outputs, with no side effects beyond their designated write targets.

[[source:811302f6/10]] [[source:811302f6/6]]

## The Agent Is a Pure Function

The agent never traverses the tree or decides what to work on. A deterministic eval script evaluates the tree against the current world state and outputs a `next-action.json`. The agent reads this and executes exactly one task. The script decides; the agent executes.

[[source:811302f6/18]]

## Tree Structure

```
Root (Sequence)
├── LoadProjectContext
│   ├── ReadOctowiki(relevant sections)
│   └── ReadRecentDecisions(last N pairs — rolling window)
├── PairAnalysis (Sequence — runs all detectors)
│   ├── DetectRatification   — did user confirm agent's proposal?
│   ├── DetectDecision       — was something concluded?
│   ├── DetectRejection      — was a direction ruled out with reasoning?
│   ├── DetectOpenQuestion   — was something flagged as unresolved?
│   └── DetectClarification  — did something fuzzy become precise?
├── ActOnSignals (produces N proposals — one per detected signal)
│   ├── [Decision or Ratification] → ProposeWikiWrite
│   ├── [Rejection]                → ProposeWikiWrite(rejected_directions)
│   ├── [OpenQuestion]             → AppendToQuestions
│   ├── [Clarification]            → ProposeWikiWrite
│   └── [no signals]               → Discard
└── MarkProcessed
```

[[source:811302f6/10]]

## Key Design Principles

### Separation of Detection from Action

Condition nodes only classify — they never write. This enables **dry-run mode**: run the tree against historical inbox data and see what it would have produced without touching Octowiki. This is how classifiers are tuned: compare proposed writes against expected output, adjust specialist prompts.

[[source:811302f6/10]]

### Specialist Loading

A generalist asked "is this a decision?" will say yes to too many things. A specialist loaded with the current Octowiki state can ask the more useful question: "does this change what we already know?" The answer is usually no — most conversation confirms existing understanding rather than changing it. The specialist context is what makes the classifier conservative by default.

[[source:811302f6/10]]

### Multi-Signal Pairs

A single pair may produce N proposals. A spec-drop pair — where the user provides a complete design document — can contain multiple distinct decisions. `processed: true` means fully analysed, not that only one signal was found.

[[source:811302f6/13]]

### Ratification Is Structurally Different

A decision can appear in a single agent turn. Ratification requires the pair — the agent turn contains the substance, the user turn is the confirmation signal. The classifier extracts what was proposed from the agent turn, then verifies the user turn is confirmatory.

The output records what the agent proposed, not the user's "yes":

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

[[source:811302f6/11]]

### Rolling Window Context

The tree carries a window of recent pairs into PairAnalysis. A user turn that corrects a prior agent claim ("I didn't confirm the stack") can only be classified correctly with the prior pair in view — without it, a correction looks like a rejection.

[[source:811302f6/12]]

### Inverted Pairs

Not all pairs follow the agent-proposes / user-confirms pattern. Spec-drop pairs are inverted: the user turn is the substantive one, the agent turn is acknowledgement. The classifier must handle both directions.

[[source:811302f6/13]]

### External Links

When a URL appears in a conversation pair, the classifier fetches it before classifying. Blog posts, documentation, and articles shared during a conversation often directly inform the decisions made in subsequent pairs — they must be treated as context, not ignored.

[[source:811302f6/31]]

## Failure Handling

| Failure | Behaviour |
|---|---|
| Octowiki read fails | Abort, re-queue the pair. Don't classify without context. |
| Classifier returns ambiguous | Route to triage queue. Don't discard. |
| Write fails | Pair stays unprocessed, retried next tick. |
| Tree crashes | Inbox entry stays `processed: false`, picked up next tick. |

[[source:811302f6/10]]

## Invariants

- A pair is processed exactly once.
- A failed classification never writes anything.
- The tree never mutates Octowiki directly — it proposes, a separate stage executes.
- The classification agent must never commit or push. Writing proposals to `state/staging/dry-run/` is the only permitted side effect.
- Every proposal carries provenance: `session_id`, `seq`, `raw_agent`, `raw_user`.

[[source:811302f6/10]] [[source:811302f6/24]]

## Context Loading

Context is loaded once per session, not per pair. All pairs in a session share a consistent Octowiki snapshot. Reloading per pair is expensive and unnecessary — pairs within a session are in the same conversation.

[[source:811302f6/11]]

## Related Pages

- [[inbox]] — the input format the tree processes
- [[write-proposals]] — the output format and staging area
- [[intent-pipeline]] — where triage sits in the full pipeline
