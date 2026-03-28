---
title: Proposal Data Format
category: data-model
tags: [proposal, schema, provenance]
summary: The schema for write proposals — fields, types, and provenance semantics.
last-modified-by: agent
---

## Proposal Schema

A write proposal is a JSON object with fields: `type` (decision, ratification, rejection, open-question, clarification), `topic` (normalised identifier), `page` (target wiki page slug), `content` (markdown ending with a `[[source:session_id/seq]]` citation), `confidence` (0.0–1.0), and `provenance` (object with `session_id`, `seq`, `raw_agent`, `raw_user`). Each field earns its place: type drives resolution logic, topic enables grouping, provenance enables auditability. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]

## Provenance Field Semantics

The provenance object contains `session_id`, `seq`, `raw_agent`, and `raw_user`. For ratifications, `raw_agent` is the meaningful content (the agent's proposal that was confirmed) and `raw_user` may be as minimal as "yes". For decisions, `raw_user` typically holds the substance. The provenance must capture the agent's statement as the meaningful content for ratifications, not the bare confirmation. [[source:811302f6-0be7-435c-b844-910cc9a21b67/11]]
