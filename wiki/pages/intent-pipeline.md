---
title: Intent Pipeline
category: functionality
tags: [pipeline, wiki, autonomy]
summary: The transformation chain from conversation to wiki, and the principle that humans don't edit the wiki directly.
last-modified-by: agent
---

## Autonomous Wiki Management

Humans do not edit the wiki directly. All architectural decisions made in conversation flow through the pipeline: inbox → triage → resolution → wiki. The wiki reflects only what the pipeline has distilled — nothing more. Manual edits bypass the loop and lose the provenance trail. [[source:811302f6-0be7-435c-b844-910cc9a21b67/28]]

## Pipeline Stages

The transformation chain is: Capture → Classification → Resolution → Application to wiki. Classification produces raw proposals that may be conflicting. Resolution consolidates them — if two proposals address the same thing, the later seq wins. Application writes the resolved proposals to the wiki. [[source:811302f6-0be7-435c-b844-910cc9a21b67/27]]
