---
title: Component Boundaries
category: architecture
tags: [components, inbox, wiki, responsibilities]
summary: The boundaries and responsibilities of each major component in the system.
last-modified-by: agent
---

## Inbox as Pipeline Entry Point

The inbox is the mouth of the pipeline — the single entry point for all raw signal. It is a capture component only: it receives conversations losslessly and makes them available to downstream processing. It has no processing logic of its own. Everything downstream — classification, resolution, wiki — is derived from what the inbox captures. [[source:811302f6-0be7-435c-b844-910cc9a21b67/5]]

## Two-Granularity Processing

Processing happens at two granularities with different mechanisms. At the session level, the `pending/` to `done/` directory move indicates whether a session has been fully consumed. At the pair level within a session, a `processed` flag on each JSONL line handles retry and idempotency. Both mechanisms serve different purposes at different granularities. [[source:811302f6-0be7-435c-b844-910cc9a21b67/10]]

## Octowiki as Authoritative Spec

The Octowiki wiki is the authoritative, human-readable specification. It is the output of the triage pipeline and the input to implementation work. The wiki is not documentation — it is the living record of intent that agents reason against. It sits between the raw conversations (upstream) and the codebase (downstream). [[source:811302f6-0be7-435c-b844-910cc9a21b67/8]]
