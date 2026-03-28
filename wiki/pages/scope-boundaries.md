---
title: Scope Boundaries
category: functionality
tags: [scope, codehealth, octowiki]
summary: What this system is and is not — explicit scope exclusions and tool boundaries.
last-modified-by: agent
---

## Scope: CodeHealth Is Not Part of This System

CodeHealth is a separate project. It is mainly for signalling when refactoring is necessary. It was incorrectly referenced in early wiki drafts as part of the pipeline and was explicitly removed. The pipeline ends at characterisation tests, not CodeHealth. [[source:811302f6-0be7-435c-b844-910cc9a21b67/17]]

## Scope: Octowiki Is Narrowly Focused

Octowiki is intended to be a narrowly focused tool. It does not check whether invariants are met in a project — that responsibility belongs to a different component. Octowiki handles wiki generation and structure, not project-level invariant verification. [[source:811302f6-0be7-435c-b844-910cc9a21b67/30]]
