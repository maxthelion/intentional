---
title: Key Decisions
category: decisions
tags: [decisions, adr, inbox, triage, behaviour-tree, ratification]
summary: "Architectural decisions made during the initial design of intentional — inbox structure, pair processing granularity, context loading strategy, and write proposal staging."
last-modified-by: agent
provenance: session_id=811302f6-0be7-435c-b844-910cc9a21b67
---

## Inbox Uses Pending/Done at Session Level

**Decision:** The inbox is split into `pending/` and `done/` directories. Session files move from `pending/` to `done/` atomically when fully processed.

**Rejected:** Per-message files (one file per message pair). This would enable atomic per-message processing but destroy the session context that triage requires.

**Rejected:** Flat inbox with `processed` flag scanning. This requires reading every file to find unprocessed sessions, which degrades as sessions accumulate.

**Rationale:** The directory is the status. A processor lists `pending/`, processes, moves to `done/`. No flag scanning, no rewriting. The session is the atomic unit of truth.

*Source: session 811302f6, seq 4–5*

---

## Session Is the Unit of Capture, Pair Is the Unit of Processing

**Decision:** One file per session in the inbox. The triage tree processes pairs within the session in order, with context loaded once per session.

**Rationale:** A session is one conversation — splitting it into per-pair files would destroy the cross-pair context needed for ratification detection and correction detection. The pair-level `processed` flag handles retry granularity within the session.

*Source: session 811302f6, seq 10–11*

---

## Context Loaded Once Per Session, Not Per Pair

**Decision:** Octowiki context is loaded once when a session begins processing. All pairs in the session share the same Octowiki snapshot.

**Rationale:** Pairs within a session are in the same conversation and share consistent context. Reloading per pair is expensive. If pair N triggers a write, pair N+1 doesn't need to re-litigate it — they're in the same conversation.

*Source: session 811302f6, seq 11*

---

## Tree Never Mutates Octowiki Directly

**Decision:** The triage tree produces structured write proposals. A separate write node executes them. Detection and action are fully separated.

**Rationale:** Failures at the write step must not corrupt the classification result. Separation also enables dry-run mode — running the tree against historical data without touching Octowiki, which is how classifiers are tuned.

*Source: session 811302f6, seq 10*

---

## Ratification Recorded as What Was Proposed, Not What Was Confirmed

**Decision:** When ratification is detected (user confirms agent's proposal), the write records the extracted proposal from the agent turn, not the user's confirmation text.

**Rationale:** `raw_user: "yes"` is useless as audit trail. The agent turn contains the substance. The user turn is a binary signal. Provenance should record what was actually decided, not the confirmation mechanism.

*Source: session 811302f6, seq 11*

---

## Rolling Window of Recent Pairs in PairAnalysis

**Decision:** The tree carries a small window of recent pairs into the classifier, not just the current pair.

**Rationale:** Some user turns can only be classified correctly with prior context. Example: "I didn't confirm the stack" — without the prior agent turn that made the unconfirmed assumption, this looks like a rejection rather than an epistemic correction. The window enables the classifier to distinguish these cases.

*Source: session 811302f6, seq 12*

---

## Signal Types and Thresholds Are Config, Not Code

**Decision:** Signal types, confidence thresholds, and section mappings live in configuration files. The tree implementation is generic. Project-specific behaviour comes from loading the right config.

**Rationale:** Adding a new signal type should be a config change, not a code change. The tree should be reusable across projects without modification.

*Source: session 811302f6, seq 10*

---

## Staging Area with Confidence-Gated Auto-Commit

**Decision:** Write proposals sit in a staging area. Above a confidence threshold they auto-commit. Below it they go to a triage queue for human review.

**Rationale:** Gives a dial between fully automatic and fully supervised. Start conservative — ratifications and explicit decisions only — and expand the auto-commit threshold as the classifier earns trust on real data.

*Source: session 811302f6, seq 10*
