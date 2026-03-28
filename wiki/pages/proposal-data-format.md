---
title: Proposal Data Format
category: data-model
tags: [proposal, schema, provenance]
summary: The schema for write proposals — fields, types, and provenance semantics.
last-modified-by: agent
---

## Proposal Schema

A write proposal is a JSON object with fields: `type` (decision, ratification, rejection, open-question, clarification), `topic` (normalised identifier), `page` (target wiki page slug), `content` (markdown ending with a `[[source:session_id/seq]]` citation), `confidence` (0.0–1.0), and `provenance` (object with `session_id`, `seq`, `raw_agent`, `raw_user`). Each field earns its place: type drives resolution logic, topic enables grouping, provenance enables auditability. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]
