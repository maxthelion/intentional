---
title: Wiki Generation
category: wiki-generation
tags: [evaluation, reference-wiki, characterisation-tests]
summary: Strategies and evaluation framework for generating wiki content from conversations.
last-modified-by: agent
---

## Reference Wiki Evaluation Framework

To evaluate different wiki generation strategies, use a reference wiki (written manually with full conversation context) as ground truth. The evaluation framework checks:

- **Completeness** — is all the right content included?
- **Invariants** — are the invariants captured? (octowiki's existing invariants pipeline already does some of this)
- **Structure** — are the pages structured sensibly?
- **Categorisation** — is content in the right categories/pages?

The reference wiki already exists in git history from the start of the session. This is the characterisation test approach applied to wiki generation itself — the reference wiki is ground truth, different strategies are evaluated against it.

[[source:811302f6-0be7-435c-b844-910cc9a21b67/50]]

## Citation Format

Every claim written to the wiki must include a citation linking back to the conversation pair that supports it, like Wikipedia footnotes. The chosen format is an inline wikilink:

```markdown
The inbox uses a pending/done directory structure. [[source:session_id/seq]]
```

This format is:
- Machine-readable and stable
- Consistent with octowiki's existing wikilink model
- Could render as a tooltip or expandable reference showing the raw pair

The citation discipline forces specialist agents to be honest about what's actually in the conversation versus what they're inferring. It also provides a free completeness check: any wiki claim without a citation is either a hallucination risk or was written by a human and needs a source added.

Specialists produce not just "write this to the wiki" but "write this claim with a citation to the pair that supports it".

[[source:811302f6-0be7-435c-b844-910cc9a21b67/51]]

## Proposal Schema Requirements

The citation format is now part of the formal proposal schema (confirmed). Every proposal must include:
- `topic` — normalised identifier for grouping and deduplication
- `content` ending with `[[source:session_id/seq]]` — visible provenance in the wiki

Citations are a required field, not just a convention. [[source:811302f6-0be7-435c-b844-910cc9a21b67/52]]

## Reference Wiki Established

The reference wiki has been created with 8 pages built in top-down order, with full `[[source:session_id/seq]]` citations:

- **functionality.md** — what humans and agents do, scope boundary
- **overview.md** — includes resolution stage, no-manual-edits, tool relationships
- **intent-pipeline.md** — resolution stage added as Stage 3, application as Stage 4
- **inbox.md** — auto-sync, multi-day sessions
- **triage-behaviour-tree.md** — multi-signal pairs, external links, inverted pairs, agent-must-not-commit
- **write-proposals.md** — topic field, citations, staging areas, conflict resolution
- **wiki-generation.md** — ordered specialist pipeline, reference wiki, evaluation checks
- **decisions.md** — 12 ADRs with full provenance citations

This is now the baseline for evaluating alternative generation strategies.

[[source:811302f6-0be7-435c-b844-910cc9a21b67/55]]
