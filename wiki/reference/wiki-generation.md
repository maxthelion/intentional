---
title: Wiki Generation
category: pipeline
tags: [generation, specialists, ordering, context-dependencies, top-down]
summary: "How Octowiki pages are generated from proposals — using an ordered sequence of specialist agents that build from high-level functionality down to implementation detail."
last-modified-by: agent
---

## The Problem with Generalist Generation

When a single generalist agent generates wiki pages, it tends toward implementation detail — describing mechanics rather than purpose. Lower-level pages (algorithms, data models) get written without grounding them in the human needs they serve.

The solution is top-down generation: start with what humans and agents expect from the system, then derive architecture, then pipelines, then data models, then algorithms. Each level is written in terms of the level above.

## Generation Order

Wiki pages are generated in category order. Each specialist reads the conversation and all pages from prior levels as context:

```
1. functionality   — what users and agents can do (no prior context needed)
2. architecture    — structure that meets functional needs
3. pipeline        — data flow through the architecture
4. data-model      — schemas and formats the pipeline operates on
5. algorithms      — computation within the data model
6. testing         — verifiable correctness derived from functionality + architecture
```

A lower-level specialist who spots something that belongs at a higher level writes it as an open question rather than writing it themselves. This keeps levels clean.

## Specialist Constraints

Each specialist:
- Reads the full conversation from `.pi/inbox/done/`
- Reads wiki pages from all prior levels as context
- Writes only to their assigned category
- Grounds every claim in the conversation — no inference beyond what was said
- Ends every content block with a `[[source:session_id/seq]]` citation
- Writes one proposal per distinct topic

## Context Dependencies

| Category | Reads from prior levels |
|---|---|
| functionality | _(none)_ |
| architecture | functionality |
| pipeline | functionality, architecture |
| data-model | functionality, architecture, pipeline |
| algorithms | functionality, architecture, pipeline, data-model |
| testing | functionality, architecture |

The testing specialist reads functionality and architecture rather than implementation levels — tests should verify behaviour, not implementation details.

## Reference Wiki

Before running the automated specialist pipeline, a reference wiki can be hand-crafted from the full conversation context. This serves as a gold standard for evaluating the quality of automated generation. Different generation strategies can be compared against it.

Evaluation checks:
- **Completeness** — is every significant decision from the conversation captured?
- **Invariant coverage** — are declared invariants machine-readable and present?
- **Categorisation** — are pages in the right categories?
- **Structure** — do pages follow the category taxonomy format?
- **Citations** — does every claim have a `[[source:session_id/seq]]` reference?
- **No hallucination** — does the wiki contain claims not supported by the conversation?

## Running the Pipeline

```bash
bun run specialist-prompt --category functionality
# agent reads prompt → writes proposals to state/staging/dry-run/specialist-functionality-*.json
# apply those proposals to wiki before proceeding

bun run specialist-prompt --category architecture
# now has functionality pages as context
# ... and so on
```

Do not run a lower level before the levels above it have been applied to the wiki — the context dependencies will be missing.

## Related Pages

- [[intent-pipeline]] — the broader pipeline this sits within
- [[triage-behaviour-tree]] — the classification stage that precedes generation
- [[write-proposals]] — the proposal format specialists produce
