---
title: System Loops
category: architecture
tags: [loops, feedback, conversation-to-wiki, wiki-to-code]
summary: The two feedback loops — conversation to wiki, and wiki to code.
last-modified-by: agent
---

## Two Feedback Loops

The system has two distinct feedback loops. The first loop is conversation → wiki: raw conversational signal is captured, classified, resolved, and applied to the wiki. The second loop is wiki → code: invariants in the wiki are compared against the codebase to detect work ("specified but not built") and missing tests ("built but not tested"). These are separate loops with different cadences and different automation levels. [[source:811302f6-0be7-435c-b844-910cc9a21b67/29]]
