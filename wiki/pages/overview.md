---
title: Overview
category: architecture
tags: [intent, pipeline, motivation, agentic-development, source-of-truth]
summary: "Intentional captures conversational intent before it evaporates, distils it into structured records, and makes those records enforceable across time — so code generated at T+N still respects decisions made at T."
last-modified-by: agent
---

## The Problem

Intent is generated continuously through conversation but never persists. It evaporates between sessions. An agent asked to build something at T+N has no reliable access to the decisions made at T — it reads the code, makes assumptions, and drifts.

The hardest problem in agentic development isn't generating code. It's ensuring that code generated at T+N still respects decisions made at T. Conventional approaches (plans, tickets, documentation) require human discipline to maintain. That discipline degrades.

## What Intentional Does

Intentional closes the loop between conversation and code by:

1. **Capturing** every conversation as a raw, lossless log
2. **Distilling** that log into structured intent — decisions, rejections, open questions
3. **Maintaining** a living wiki (Octowiki) that is the current authoritative statement of what the system is and why
4. **Deriving** characterisation tests from invariants declared in the wiki
5. **Auditing** continuously whether the codebase still reflects that intent

The result is traceable in the NASA sense — automatically, not by discipline. Any test traces back to a characterisation decision, any decision traces back to an Octowiki entry, any entry traces back to the conversation where it was decided, and that conversation back to the raw inbox log.

## What It Is Not

- It is not a task manager. Intentional does not track what to build next.
- It is not a documentation tool that humans maintain. Agents maintain it.
- It is not a test framework. It derives tests from intent; the tests live in the project.

## Core Principle

**Conversations are the source of truth. Everything else is derived.**

Code is a derived product of the specification. Tests are a derived product of the specification. Octowiki is the specification. The inbox is the raw material from which the specification is built.

## Related Pages

- [[intent-pipeline]] — the full transformation chain from conversation to characterisation tests
- [[inbox]] — how raw conversations are captured and structured
- [[triage-behaviour-tree]] — the decision process that distils conversations into intent
