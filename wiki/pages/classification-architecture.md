---
title: Classification Architecture
category: architecture
tags: [classification, specialists, sequenced]
summary: Specialist readers replace the generalist classifier — sequenced from high-level to low-level.
last-modified-by: agent
---

## Specialist Readers Replace Generalist Classifier

Instead of one generalist classifier asking "is there any signal here?", multiple specialists run against the same conversation, each viewing it through their own lens (architect, tester, data-modeler, etc.). Each specialist is loaded with only the relevant Octowiki sections for their domain. This produces lower false positive rates and better categorisation because each specialist already knows what category they're writing for. It also partially dissolves the resolution problem — specialists write to their own domains, so cross-domain conflicts don't arise. [[source:811302f6-0be7-435c-b844-910cc9a21b67/50]]

## Specialist Pipeline Is Sequenced, Not Parallel

The specialist reader pipeline is sequenced from high-level to low-level: functionality → architecture → pipeline → data-model → algorithms → testing. Each level depends on the one above — an algorithm page written without knowing what human need it serves will default to describing mechanics, not purpose. Each specialist gets the conversation AND all pages produced by levels above as context. This ordering prevents the implementation-focused tendency observed in previous attempts at auto-generating the wiki. [[source:811302f6-0be7-435c-b844-910cc9a21b67/53]]
