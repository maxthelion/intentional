---
title: Pipeline Architecture
category: architecture
tags: [pipeline, classification, resolution, application]
summary: The three-stage pipeline — classification, resolution, and application — with distinct responsibilities.
last-modified-by: agent
---

## Three-Stage Pipeline Architecture

The pipeline has three distinct stages with separate responsibilities. Classification (LLM) produces raw proposals that may conflict. Resolution (mostly deterministic) consolidates proposals — grouping by topic, applying recency rules where later seq wins. Application writes resolved proposals to the wiki. These stages must not be conflated — classification and resolution were originally combined and were explicitly separated. [[source:811302f6-0be7-435c-b844-910cc9a21b67/27]]
