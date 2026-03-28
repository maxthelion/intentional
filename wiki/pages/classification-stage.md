---
title: Classification Stage
category: pipeline
tags: [classification, triage, proposals]
summary: The classification stage — inputs, outputs, and how pairs are processed into proposals.
last-modified-by: agent
---

## Classification Stage Inputs and Output

The classification stage receives a structured prompt containing: the pair to classify, a rolling window of prior pairs (for correction detection), and relevant Octowiki sections as context. It produces one output per pair — either a structured write proposal (JSON with type, topic, content, confidence, provenance) or a DISCARD with reasoning. The agent processes one pair at a time as a pure function. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]
