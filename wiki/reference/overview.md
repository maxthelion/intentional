---
title: Overview
category: architecture
tags: [intent, motivation, agentic-development, source-of-truth, traceability]
summary: "Intentional captures conversational intent before it evaporates, distils it into structured records, and makes those records enforceable across time."
last-modified-by: agent
---

## The Problem

Intent is generated continuously through conversation but never persists. It evaporates between sessions. An agent asked to build something at T+N has no reliable access to the decisions made at T — it reads the code, makes assumptions, and drifts.

The hardest problem in agentic development isn't generating code. It's ensuring that code generated at T+N still respects decisions made at T. Conventional approaches — plans, tickets, documentation — require human discipline to maintain. That discipline degrades.

[[source:811302f6/5]]

## Core Principle

**Conversations are the source of truth. Everything else is derived.**

Code is a derived product of the specification. Tests are a derived product of the specification. Octowiki is the specification. The inbox is the raw material from which the specification is built.

[[source:811302f6/5]]

## How It Works

Intentional closes the loop between conversation and code:

1. **Captures** every conversation as a raw, lossless log — no judgement, no filtering
2. **Distils** that log into structured intent — decisions, rejections, open questions — using a behaviour tree classifier
3. **Resolves** conflicts between proposals — later decisions supersede earlier ones, by recency
4. **Maintains** a living wiki (Octowiki) that is the current authoritative statement of what the system is and why
5. **Derives** characterisation tests from invariants declared in the wiki

The result is traceable in the NASA sense — automatically, not by discipline. Any test traces back to a characterisation decision. Any decision traces back to an Octowiki entry. Any entry traces back to the conversation where it was decided. That conversation traces back to the raw inbox log.

[[source:811302f6/5]]

## Relationship to Other Tools

**Shoe-makers** — the reference implementation for the agents-as-pure-functions-in-a-behaviour-tree pattern. Intentional borrows the architectural approach (deterministic eval script, agent as pure function) but is a standalone project with a different purpose. [[source:811302f6/11]]

**Octowiki** — the wiki system that intentional writes to. Octowiki owns the wiki format, rendering, search, and consistency checking. Intentional owns the pipeline that populates it. [[source:811302f6/9]]

**Octowiki invariants** — a separate pipeline that checks whether invariants declared in the wiki are met by the codebase. This is downstream of intentional, not part of it. [[source:811302f6/30]]

## What Agents Should Never Do

The wiki must not be edited manually. All updates flow through the pipeline: inbox → triage → resolution → wiki. Manual edits bypass the provenance trail and undermine the traceability guarantee.

[[source:811302f6/28]]

## Related Pages

- [[functionality]] — what humans and agents can do with this system
- [[intent-pipeline]] — the full transformation chain
- [[triage-behaviour-tree]] — the classification mechanism
