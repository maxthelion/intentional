---
title: Signal Types
category: functionality
tags: [classification, ratification, signals]
summary: The types of signals detected in conversations — ratification, false ratification, corrections, and indifference.
last-modified-by: agent
---

## False Ratification Detection

The classifier must detect when an agent presents an assumption as a confirmed decision (false ratification). When a user corrects or pushes back on an agent's framing, that is a signal that the prior framing was wrong. Corrections and "I don't care" responses are distinct signal types — a correction invalidates a prior claim, while indifference means the topic isn't worth recording at all. [[source:811302f6-0be7-435c-b844-910cc9a21b67/12]]

## Ratification as a Signal Type

When a user says "yes" in response to an agent's proposal, the user turn has zero information content in isolation. The agent turn is where the substance lives — the user turn is purely a confirmation signal. Provenance for ratifications must capture the agent's statement as the meaningful content, not the bare "yes". This is structurally different from decision detection. [[source:811302f6-0be7-435c-b844-910cc9a21b67/11]]
