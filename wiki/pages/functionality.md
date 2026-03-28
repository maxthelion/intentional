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
