---
title: Functionality
category: functionality
tags: [users, agents, interaction, expectations, use-cases]
summary: "How humans and agents interact with intentional — what they can do, what they expect, and what success looks like from their perspective."
last-modified-by: agent
---

## Who Uses This System

There are two actors:

**Humans** — developers who have conversations with agents while building software. They do not maintain documentation. They ask for things, confirm proposals, reject directions, and raise questions. They expect that what they said in conversation is remembered and respected by future agents.

**Agents** — autonomous coding agents that run on a schedule against a codebase. They read the wiki to understand intent, derive tests from invariants, and check whether the code still reflects what was decided. They expect the wiki to be accurate and traceable.

## What Humans Can Do

- Have a conversation with an agent — that conversation is captured automatically, no action required
- Trust that decisions made in conversation will persist and be visible to future agents
- Review and approve wiki changes before they are committed (during early supervised mode)
- Reset the triage pipeline and re-run it against historical conversations to tune the classifier
- Follow any wiki entry back to the conversation where it was decided

[[source:811302f6/5]]

## What Agents Can Do

- Read Octowiki to understand what the system is, why it works the way it does, and what decisions have been made
- Trace any wiki entry back to the specific conversation pair that established it via `[[source:session_id/seq]]` citations
- Derive characterisation tests from invariants declared in the wiki
- Check whether the codebase still reflects the wiki (via octowiki invariants)
- Process new inbox sessions and propose wiki updates without human intervention (once trust is established)

[[source:811302f6/5]]

## What Success Looks Like

- A developer makes a decision in conversation at time T
- At time T+N, a different agent reads the wiki and correctly understands that decision, its rationale, and the conversation where it was made
- No human maintained anything between T and T+N

The system has succeeded when: code generated at T+N still respects decisions made at T, automatically, without requiring the human to repeat themselves or maintain documentation.

[[source:811302f6/5]]

## What This System Is Not

- **Not a task manager.** Intentional does not track what to build next. That is the job of the agent loop (shoe-makers pattern).
- **Not a documentation tool humans maintain.** Agents maintain the wiki. Humans have conversations.
- **Not a test framework.** It derives the specification from which tests are written; the tests live in the project under test.
- **Not a code health tool.** Checking whether invariants are met in code is the job of octowiki invariants and related tools.

[[source:811302f6/30]]

## Scope Boundary

Intentional is narrowly focused: **conversation → wiki**. It does not check whether invariants are met in a project — that is the job of a different component (octowiki invariants). It does not write code. It does not track work items.

Adding new capabilities should be questioned against this boundary: does it belong in the conversation-to-wiki pipeline, or does it belong somewhere else?

[[source:811302f6/30]]
