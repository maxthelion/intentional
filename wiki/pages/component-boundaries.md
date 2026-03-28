---
title: Component Boundaries
category: architecture
tags: [components, inbox, wiki, responsibilities]
summary: The boundaries and responsibilities of each major component in the system.
last-modified-by: agent
---

## Inbox as Pipeline Entry Point

The inbox is the mouth of the pipeline — the single entry point for all raw signal. It is a capture component only: it receives conversations losslessly and makes them available to downstream processing. It has no processing logic of its own. Everything downstream — classification, resolution, wiki — is derived from what the inbox captures. [[source:811302f6-0be7-435c-b844-910cc9a21b67/5]]
