---
title: Provenance Architecture
category: architecture
tags: [provenance, traceability, citations]
summary: How the provenance chain ensures every wiki claim traces back to a conversation.
last-modified-by: agent
---

## Provenance Traceability

Every wiki claim must trace back to a conversation pair via `[[source:session_id/seq]]` citations. The provenance chain runs: raw conversation → proposal (with session_id, seq, raw_agent, raw_user) → wiki page (with source citation). This chain must never be broken — manual edits bypass the loop and lose the provenance trail. The provenance is what makes the wiki auditable and the pipeline trustworthy. [[source:811302f6-0be7-435c-b844-910cc9a21b67/28]]

## Citation Format: Inline Wikilinks

The citation format for wiki claims is `[[source:session_id/seq]]` — an inline wikilink that is machine-readable, stable, and consistent with octowiki's existing link model. This format could render as a tooltip or expandable reference showing the raw pair. The citation discipline forces the agent to be honest about what's actually in the conversation versus what it's inferring. A wiki claim with no citation is flagged as either hallucination or needing a citation added. [[source:811302f6-0be7-435c-b844-910cc9a21b67/51]]
