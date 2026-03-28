---
title: Classification Algorithms
category: algorithms
tags: [classification, detectors, rolling-window, limitations]
summary: How the classifier works — signal detectors, rolling window, and known limitations.
last-modified-by: agent
---

## Rolling Window for Correction Detection

The classification prompt includes a rolling window of prior pairs (2 pairs) as context. This enables detection of corrections and false ratifications — where a user pushes back on an agent's prior framing. Without this window, the classifier would process each pair in isolation and miss cross-pair signals like "no, that's wrong" referring to a previous exchange. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]

## Pair-Level Analysis Limitation

Pair-level analysis has a known gap: indirect influence across pairs is not captured. A pair that provides context (e.g., reading a blog post) may produce no signal itself, but the content shapes decisions in later pairs. The classifier correctly discards the contextual pair at the pair level, but the pipeline does not track this indirect influence. This is a known limitation, not a bug. [[source:811302f6-0be7-435c-b844-910cc9a21b67/23]]
