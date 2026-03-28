---
title: State Layout
category: data-model
tags: [state, directory, layout]
summary: The state directory structure — next-action, specialist progress, and staging subdirectories.
last-modified-by: agent
---

## State Directory Structure

The state directory holds all ephemeral working files: `state/next-action.json` (eval output describing the next task), `state/specialist-progress.json` (tracks specialist pipeline progress), and `state/staging/` with subdirectories `dry-run/` (proposals committed on agent branch for review), `pending/` (proposals approved for auto-commit), and `done/` (proposals applied to wiki). The `dry-run/` directory is not gitignored — proposals there are committed for review. [[source:811302f6-0be7-435c-b844-910cc9a21b67/18]]
