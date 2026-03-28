---
title: Write Proposals
category: data-model
tags: [proposals, staging, dry-run, resolution, confidence, provenance, citations]
summary: "The structured output of triage — proposals sit in staging before being resolved and applied to Octowiki. Never written directly; always proposed, reviewed, resolved, then applied."
last-modified-by: agent
---

## What a Proposal Is

A write proposal is the output of the triage classifier for a single detected signal. It is a structured JSON object — not raw text — that sits in a staging area before being applied to Octowiki. The tree never writes to Octowiki directly; it always produces a proposal first.

[[source:811302f6/10]]

## Format

```json
{
  "id": "{session_id}-seq{seq}-{index}",
  "type": "decision | ratification | rejection | open-question | clarification",
  "project": "intentional",
  "section": "inbox",
  "topic": "inbox-structure",
  "content": "Markdown content to write to the wiki. [[source:811302f6/4]]",
  "confidence": 0.9,
  "provenance": {
    "session_id": "811302f6-0be7-435c-b844-910cc9a21b67",
    "seq": 4,
    "raw_agent": "Relevant excerpt from agent turn...",
    "raw_user": "I think pending and done might be best",
    "what_was_ratified": "For ratification type only — the substance extracted from the agent turn"
  },
  "dry_run": true,
  "created_at": "2026-03-27T14:49:52.475Z"
}
```

### Key Fields

**`topic`** — a short normalised identifier for what this proposal is about (e.g. `"inbox-structure"`, `"bt-invariants"`). Used by the resolution stage to group conflicting proposals. Two proposals with the same `topic` are about the same thing — the later one supersedes the earlier.

**`content`** — markdown to be written to the wiki. Must end with a `[[source:session_id/seq]]` citation so the provenance chain is visible in the wiki itself.

**`confidence`** — 0–1. Above the auto-commit threshold, proposals are applied automatically. Below it, they go to the triage queue for human review.

**`what_was_ratified`** — for ratification type only. The substance extracted from the agent turn. `raw_user: "yes"` is useless as audit trail; this field records what was actually confirmed.

[[source:811302f6/11]]

## Citations in Wiki Content

Every piece of content written to Octowiki must include an inline citation in the format `[[source:session_id/seq]]`. This makes the provenance chain visible to both humans reading the wiki and agents reasoning about it. Any claim can be traced back to the conversation pair that established it.

A wiki page may have multiple citations on different sections, each pointing to the specific pair that established that claim.

## Staging Areas

```
state/staging/
  dry-run/    ← proposals produced by classifier (default)
  resolved/   ← proposals after conflict resolution
  pending/    ← proposals above confidence threshold, approved for commit
  done/       ← proposals applied to wiki
```

Proposals are ephemeral — they are not source of truth and are not committed to main. They are regenerated on each triage run. The session archive in `done/` is the only thing that must be preserved permanently.

[[source:811302f6/26]]

## Conflict Resolution

When two proposals address the same `topic`, the later one supersedes the earlier. Resolution is agentic — it reads proposals alongside the original conversation pairs so it can reason about intent, not just the extracted text. Superseded proposals are marked but preserved for audit.

Proposals must be applied in chronological order (by `seq`) so that later decisions correctly override earlier ones.

[[source:811302f6/27]] [[source:811302f6/25]]

## Confidence-Gated Auto-Commit

The auto-commit threshold starts conservative — only ratifications and explicit decisions with high confidence. As the classifier earns trust on real data, the threshold is lowered to include more signal types. This gives a dial between fully supervised and fully automatic.

[[source:811302f6/10]]

## Related Pages

- [[triage-behaviour-tree]] — what produces proposals
- [[intent-pipeline]] — where proposals fit in the full pipeline
- [[inbox]] — the source of truth proposals are derived from
