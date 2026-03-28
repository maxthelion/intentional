---
title: Characterisation Tests
category: functionality
tags: [testing, invariants, automation]
summary: Autonomous agents should write characterisation tests for decisions, detecting spec-vs-implementation deltas.
last-modified-by: agent
---

## Autonomous Characterisation Tests

When a new invariant enters the spec, there is a delta between the spec and the implementation — that delta is work. If an agent builds something but no tests are added, the eventual desire is that autonomous agents rectify this by writing characterisation tests of decisions that have been made. The system should detect both "specified but not built" and "built but not tested" states. [[source:811302f6-0be7-435c-b844-910cc9a21b67/29]]
