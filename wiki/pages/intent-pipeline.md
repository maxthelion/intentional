---
title: Intent Pipeline
category: intent-pipeline
tags: [architecture, classification, specialists]
summary: Architecture of the intent extraction pipeline, including specialist reader approach.
last-modified-by: agent
---

## Specialist Reader Architecture

Instead of a single generalist classifier asking "is there any signal here?", the pipeline runs multiple domain specialists against the same conversation. Each specialist is loaded with only the relevant Octowiki sections for their domain. The architect asks "does this change the system structure?", not "is this any kind of signal?". Benefits:

- Lower false positive rate — each specialist knows its domain
- Better categorisation — the specialist already knows what category they're writing for
- Partially dissolves the resolution problem — specialists write to their own domains, so conflicts within a domain are rare and cross-domain conflicts don't really exist

[[source:811302f6-0be7-435c-b844-910cc9a21b67/50]]

## Specialist Sequencing Order

The specialist reader pipeline is not parallel — it is sequenced. Lower-level pages depend on higher-level pages for context, preventing implementation-focused drift.

The ordering follows the octowiki category taxonomy:

```
Conversation
  → Functionality specialist  → functionality pages
  → Architecture specialist   (reads functionality pages) → architecture pages
  → Pipeline specialist       (reads architecture pages) → pipeline pages
  → Data-model specialist     (reads pipeline pages) → data-model pages
  → Algorithm specialist      (reads data-model pages) → algorithm pages
  → Testing specialist        (reads algorithm pages) → testing pages
```

Each specialist gets the full conversation AND all pages produced by levels above. Higher-level pages steer lower-level generation toward purpose rather than mechanics.

The citation format supports cross-level references — a data-model page can cite both a conversation pair (`[[source:session_id/seq]]`) and a functionality page as the reason a field exists.

This also enables an adversarial check after each level: does this page serve the level above? An architecture page that can't be traced to a functionality need is suspect.

[[source:811302f6-0be7-435c-b844-910cc9a21b67/53]]

## Ordering Implementation — Confirmed

The specialist sequencing order has been implemented in code: config defining the category order and context dependencies, a specialist prompt builder, and the SCHEDULED_PROMPT updated to describe the specialist generation mode.

The functionality specialist has no context dependencies — it reads the raw conversation and asks "what can humans and agents do with this system?" Everything else flows from that.

Next step: run the functionality specialist against the founding session as the first real test of whether top-down generation avoids the implementation-first problem. [[source:811302f6-0be7-435c-b844-910cc9a21b67/54]]

## Specialist Pipeline Status

**What works:**
- `bun run specialist-prompt --category X` generates the correct prompt with conversation + prior-level context
- Each level correctly loads pages from prior levels

**What's missing:**
- An **apply step** (`src/apply.ts`) — no script that takes proposals from `state/staging/dry-run/` and writes them to wiki pages. An agent must do this manually between each specialist run.
- **Orchestration** — nothing runs the six levels in sequence, applying between each
- The `SCHEDULED_PROMPT.md` describes the specialist flow but it's manual — an agent runs each level, applies proposals, then runs the next

Currently works if an agent follows the steps in `SCHEDULED_PROMPT.md` manually. No automated end-to-end run yet.

[[source:811302f6-0be7-435c-b844-910cc9a21b67/56]]

## Open Question: Build src/apply.ts

The missing piece for end-to-end specialist pipeline operation is `src/apply.ts` — a script that reads resolved proposals and writes wiki pages with citations. Without it, an agent must manually apply proposals between each specialist level.

[[source:811302f6-0be7-435c-b844-910cc9a21b67/56]]
