## Gitignore Rules

- `state/staging/dry-run/` is intentionally **NOT gitignored**. Proposals in dry-run are committed on the agent's branch so they can be reviewed. Do not add it to .gitignore.
- `state/staging/pending/`, `state/staging/done/`, `state/next-action.json`, and `state/current-task.md` are gitignored — these are ephemeral working files.

## Working Conventions

- **If you say something is ready, committed, or pushed — it must already be committed and pushed at that point.** Do not say it is ready and then commit afterwards in response to a failure. Check `git status` before declaring done.
- **Commit and push as you go.** Do not batch up changes and commit at the end. Each logical unit of work gets its own commit immediately.

<!-- octowiki -->
## OctoWiki

This project uses OctoWiki for documentation.

- Run `bunx octowiki serve` to browse the wiki
- Wiki pages live in `wiki/pages/` — update them before implementing changes
- Use `/octowiki:add-page` to create new wiki pages
- Use `/octowiki:batch-import` to import docs from a repo
- Use `/octowiki:invariants` to check spec-vs-code coverage
<!-- /octowiki -->
