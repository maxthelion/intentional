---
title: Classification Architecture
category: architecture
tags: [classification, specialists, parallel]
summary: Specialist readers replace the generalist classifier — multiple domain experts process the same conversation in parallel.
last-modified-by: agent
---

## Specialist Readers Replace Generalist Classifier

Instead of one generalist classifier asking "is there any signal here?", multiple specialists run in parallel against the same conversation, each viewing it through their own lens (architect, tester, data-modeler, etc.). Each specialist is loaded with only the relevant Octowiki sections for their domain. This produces lower false positive rates and better categorisation because each specialist already knows what category they're writing for. It also partially dissolves the resolution problem — specialists write to their own domains, so cross-domain conflicts don't arise. [[source:811302f6-0be7-435c-b844-910cc9a21b67/50]]
