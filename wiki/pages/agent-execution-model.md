---
title: Agent Execution Model
category: functionality
tags: [agent, behaviour-tree, pure-function]
summary: How agents execute tasks within the behaviour tree — as pure functions, not autonomous reasoners.
last-modified-by: agent
---

## Agent as Pure Function

The agent should not traverse the behaviour tree itself — reasoning about what to do is where agents go wrong. The traversal is deterministic: a script runs before the agent and evaluates the tree mechanically. The agent gets handed a specific task and executes it as a pure function. Same principle as the shoe-makers project. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]
