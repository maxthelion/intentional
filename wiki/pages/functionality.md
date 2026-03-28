---
title: Functionality
category: functionality
tags: [user-interaction, agents, system-capabilities]
summary: How humans and agents interact with the intentional system — what they can do, what they expect, what success looks like.
last-modified-by: agent
---

# Functionality

## Agent as Pure Function

The agent does not decide what to do — the behaviour tree decides. A deterministic script (`bun run eval`) evaluates the tree and writes `state/next-action.json`. The agent reads this and executes exactly the specified action.

The agent's only permitted side effect is writing proposals to `state/staging/dry-run/`. It must not commit, push, or modify files outside its designated output area. The tree traversal is deterministic; the agent is a pure function that transforms input into proposals. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]

This was validated when a test run showed the agent committing and pushing on its own initiative despite the prompt not requesting it — confirming the need for explicit constraints. [[source:811302f6-0be7-435c-b844-910cc9a21b67/24]]

## Intent Capture

The system exists because intent is generated continuously through conversation but never persists — it evaporates between sessions. The goal is to close that loop: capture the raw signal, distil it into structured intent, and maintain a living record that future agents can reason against.

Conversations are the source of truth for intent. Everything else is derived. The inbox captures complete conversation sessions as JSONL files — one file per session, append-only, lossless. Raw capture is immutable: once a session moves to `done/`, it is never modified. [[source:811302f6-0be7-435c-b844-910cc9a21b67/5]]

## Inbox Structure

The inbox uses a `pending/done` directory structure. One file per conversation session, named with timestamp and UUID. The processor lists `pending/`, picks up a file, processes it, and moves it to `done/` — atomic, no rewriting, no flag scanning. The directory location is the status. Within a session file, each message pair has a `processed` flag for pair-level tracking. [[source:811302f6-0be7-435c-b844-910cc9a21b67/4]]

## Pipeline Stages

The system is a transformation pipeline with four stages:

1. **Capture** — raw conversation sessions land in the inbox
2. **Triage** — a behaviour tree classifies message pairs and produces write proposals
3. **Resolution** — proposals are consolidated; if two proposals address the same topic, the later one (by seq or session) wins
4. **Application** — resolved proposals are written to the wiki with citations

The wiki (Octowiki) is the authoritative, human-readable specification. Characterisation tests are derived from the wiki to verify that code matches the spec. [[source:811302f6-0be7-435c-b844-910cc9a21b67/5]]

The resolution stage was added as a separate step because classification and consolidation should not be conflated — one step generates proposals, another resolves conflicts by recency. [[source:811302f6-0be7-435c-b844-910cc9a21b67/27]]

## Pair-Level Classification

The atomic unit of analysis is the agent/user message pair. Each pair is classified against a set of detectors:

- **Decision** — the user makes a choice or states an intent
- **Ratification** — the user confirms something the agent proposed (e.g. "yes"). The substance lives in the agent turn, not the user turn
- **Rejection** — the user rejects or corrects something
- **Clarification** — a concept is refined or explained
- **Open question** — something raised but not resolved

A known limitation: pair-level analysis cannot capture indirect influence across pairs. A blog post read in one pair may shape decisions in later pairs without being detectable at the pair level. [[source:811302f6-0be7-435c-b844-910cc9a21b67/11]]

Ratification is structurally different from other signal types. When a user says "yes", the raw_user field is almost useless as audit trail — provenance must capture the agent turn that contains the actual substance being confirmed. [[source:811302f6-0be7-435c-b844-910cc9a21b67/11]]

## Specialist Readers

Instead of one generalist classifier asking "is there any signal here?", multiple domain-specific specialists read the same conversation through different lenses. Each specialist is loaded with only the relevant context for their domain, producing proposals within their own category. This yields a lower false positive rate and better categorisation than a generalist approach. [[source:811302f6-0be7-435c-b844-910cc9a21b67/50]]

The specialist pipeline is ordered, not parallel. Each level depends on the one above:

1. **Functionality** — what humans and agents can do, what they expect
2. **Architecture** — how the system is structured to meet those needs
3. **Pipeline** — how data flows through it
4. **Data model** — what the structures look like
5. **Algorithms** — how the computation works
6. **Testing** — how correctness is verified

Each specialist receives the conversation plus all pages produced by prior levels as context. This prevents the implementation-focused drift seen in previous attempts at auto-generating the wiki. [[source:811302f6-0be7-435c-b844-910cc9a21b67/53]]

## Wiki Citations

Every claim in the wiki must include a citation back to the conversation pair that supports it, using the format `[[source:session_id/seq]]`. This makes the traceability chain visible rather than buried in proposal metadata — like Wikipedia citations.

The citation discipline forces the agent to be honest about what is actually in the conversation versus what it is inferring. It also provides a completeness check: a wiki claim with no citation is either a hallucination risk or was written manually and needs a source. [[source:811302f6-0be7-435c-b844-910cc9a21b67/51]]

## No Manual Wiki Edits

The wiki must not be edited directly by humans or agents outside the pipeline. Any architectural decision made in conversation should flow through: inbox → triage → resolution → wiki. Manual edits bypass the loop and lose the provenance trail. The wiki reflects only what the pipeline has distilled — nothing more. [[source:811302f6-0be7-435c-b844-910cc9a21b67/28]]

## Spec-Code Delta as Work

When a new invariant enters the wiki spec, there is potentially a delta between what is specified and what is implemented — that delta is the work that needs doing. Two cases:

- **Specified but not built** — the spec has moved ahead of the code. An agent can detect this: "this invariant is declared but I can't find evidence it's satisfied."
- **Built but not tested** — code exists but no characterisation test freezes its behaviour. The user's eventual desire is that autonomous agents write characterisation tests for decisions that have been made.

Octowiki's invariants pipeline handles the detection half. A separate component (not octowiki itself) would be responsible for acting on the delta. [[source:811302f6-0be7-435c-b844-910cc9a21b67/29]]

## Reset and Regenerate

The wiki can be wiped and regenerated from scratch at any time using the specialist pipeline. This is possible because conversations are the source of truth and everything else is derived. The workflow is: reset the wiki, reset session processing state, then run the specialist pipeline from the top. This supports iterating on generation strategies and comparing outputs against a reference wiki. [[source:811302f6-0be7-435c-b844-910cc9a21b67/26]]

A reference wiki (written manually with full context) serves as the baseline for evaluating generation quality. Different strategies can be compared against it using checks for completeness, invariant coverage, page structure, and categorisation. [[source:811302f6-0be7-435c-b844-910cc9a21b67/50]]

## External Link Fetching

When external links are mentioned in a conversation, agents should follow them and consider their content for relevancy. Blog posts and other linked material may be directly relevant to the project's design decisions. In an early test run, a pair containing a blog post URL was discarded as noise; after adding URL-fetching instructions, the same pair produced a useful clarification signal. [[source:811302f6-0be7-435c-b844-910cc9a21b67/31]]
