---
title: Key Decisions
category: decisions
tags: [decisions, adr, inbox, triage, behaviour-tree, generation, scope]
summary: "Architectural decisions made during the design of intentional — with provenance back to the founding session."
last-modified-by: agent
---

## Conversations Are the Source of Truth

**Decision:** Conversations are the source of truth for intent. Everything else — code, tests, documentation — is derived.

**Rationale:** The hardest problem in agentic development is ensuring code generated at T+N still respects decisions made at T. If decisions live only in conversation and evaporate between sessions, agents at T+N have no reliable access to them. Making the conversation the source of truth and automatically distilling it closes this loop.

[[source:811302f6/5]]

---

## Inbox Uses Pending/Done at Session Level

**Decision:** The inbox is split into `pending/` and `done/` directories. Session files move atomically when fully processed.

**Rejected:** Per-message files — destroys the session context needed for ratification and correction detection.
**Rejected:** Flat inbox with `processed` flag scanning — degrades as sessions accumulate.

**Rationale:** The directory is the status. No flag scanning, no rewriting. The session is the atomic unit of truth.

[[source:811302f6/4]] [[source:811302f6/5]]

---

## Session Is the Unit of Capture; Pair Is the Unit of Processing

**Decision:** One file per session. The triage tree processes pairs within the session in order, with context loaded once per session.

**Rationale:** Cross-pair context is required for ratification and correction detection. The pair-level `processed` flag handles retry granularity within a session.

[[source:811302f6/11]]

---

## Tree Never Mutates Octowiki Directly

**Decision:** The triage tree produces structured write proposals. A separate stage executes them.

**Rationale:** Failures at the write step must not corrupt the classification result. Separation also enables dry-run mode for tuning the classifier.

[[source:811302f6/10]]

---

## Ratification Recorded as the Proposal, Not the Confirmation

**Decision:** When a user ratifies an agent proposal, the write records what the agent proposed — extracted from the agent turn — not the user's confirmation text.

**Rationale:** `raw_user: "yes"` is useless as audit trail. The substance is in the agent turn.

[[source:811302f6/11]]

---

## Resolution Stage Between Classification and Application

**Decision:** The pipeline has a resolution stage between triage and wiki application. Raw proposals (possibly conflicting) are consolidated before being written.

**Rationale:** A conversation may say "A is blue" at seq 5 and "A is red" at seq 17. Both proposals get generated; resolution detects the conflict, applies recency (seq 17 wins), and marks seq 5 as superseded. The wiki receives one authoritative statement.

[[source:811302f6/27]]

---

## No Manual Wiki Edits

**Decision:** The wiki must not be edited manually. All updates flow through the pipeline: inbox → triage → resolution → wiki.

**Rationale:** Manual edits bypass the provenance trail and undermine the traceability guarantee. The wiki's value depends on every entry being traceable to a conversation.

[[source:811302f6/28]]

---

## Citations in Wiki Content

**Decision:** Every claim written to Octowiki includes an inline citation: `[[source:session_id/seq]]`.

**Rationale:** Provenance must be visible in the wiki itself, not just in proposal metadata. Any claim should be followable back to the conversation that established it. Citations also flag hallucinations — a claim with no citation either came from nowhere or was written manually.

*(decided in founding session, later pairs)*

---

## CodeHealth Is Not Part of This Pipeline

**Decision:** CodeHealth is a separate project for signalling when refactoring is necessary. It is not a stage in the intentional pipeline.

**Rationale:** Intentional's scope is conversation → wiki. Checking whether invariants are met in code is a different concern, handled by octowiki invariants and related tools.

[[source:811302f6/17]]

---

## Intentional Stays Narrowly Focused

**Decision:** Intentional is scoped to conversation → wiki (triage, resolution, application). It does not check invariants in code, generate work items, or write tests.

**Rationale:** The value of the tool comes from doing one thing well. Adding scope risks the implementation-focused drift seen in less constrained tools.

[[source:811302f6/30]]

---

## Wiki Generation Uses Ordered Specialists

**Decision:** Wiki generation uses a sequence of specialists (functionality → architecture → pipeline → data-model → algorithms → testing), each reading prior levels as context.

**Rationale:** Generalist agents writing wiki pages default to implementation detail. Top-down generation ensures lower-level pages are grounded in the human needs they serve. Each specialist reads only the level above, keeping context focused and generation conservative.

*(decided in founding session, later pairs)*

---

## Classification Agent Must Not Commit or Push

**Decision:** The classification agent's only permitted side effect is writing proposals to `state/staging/dry-run/`. It must never commit or push.

**Rationale:** Git history is a side channel that should be controlled. Proposals are ephemeral derived output; the immutable source is the inbox archive.

[[source:811302f6/24]]
