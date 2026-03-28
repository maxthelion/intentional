# Apply Proposal to Wiki

Apply the following proposal to the wiki. Your job is to write or update a wiki page so it accurately reflects the proposal content.

## Proposal

```json
{
  "type": "decision",
  "category": "functionality",
  "topic": "external-link-fetching",
  "page": "functionality",
  "content": "## External Link Fetching\n\nWhen external links are mentioned in a conversation, agents should follow them and consider their content for relevancy. Blog posts and other linked material may be directly relevant to the project's design decisions. In an early test run, a pair containing a blog post URL was discarded as noise; after adding URL-fetching instructions, the same pair produced a useful clarification signal. [[source:811302f6-0be7-435c-b844-910cc9a21b67/31]]",
  "confidence": 0.85,
  "provenance": {
    "session_id": "811302f6-0be7-435c-b844-910cc9a21b67",
    "seq": 31,
    "raw_agent": "The URL-fetching instruction means the blog posts in seq 6 should no longer be discarded — the agent will curl them, read them, and use them as context.",
    "raw_user": "make a note that when external links are mentioned, they should be followed and considered for relevancy. The blog posts we mentioned at the top of this conversation were pretty relevant to the plan"
  }
}
```

## Current Page (/home/user/intentional/wiki/pages/undefined.md)

(page does not exist yet — create it)

## Original Conversation Pair (for additional context)

**Agent (seq=31):** Now update the SCHEDULED_PROMPT and classify-prompt:

Now update the classify prompt to handle external links:

Done. The flow for a fresh run is now:

```bash
bun run reset-wiki          # clear manually-written wiki pages
bun run reset-session --all # move session back to pending/
# then paste SCHEDULED_PROMPT.md into the sandbox
```

The URL-fetching instruction means the blog posts in seq 6 should no longer be discarded — the agent will curl them, read them, and use them as context for understanding the decisions that follow. That should produce richer proposals for the pairs that came after, where the blog architecture directly shaped the design.

**User:** ok. Let's maybe change the agent prompt to write to a brand new wiki. Maybe delete what's already there. Possibly also make a note that when external links are mentioned, they should be followed and considered for relevancy. The blog posts we mentioned at the top of this conversation were pretty relevant to the plan

## Instructions

1. Read the proposal content carefully.
2. Read the current page (if it exists).
3. Update the page to incorporate the proposal:
   - If the page doesn't exist, create it with appropriate frontmatter (title, category: undefined, tags, summary, last-modified-by: agent)
   - If the page exists, find the right place to add or update content — do not duplicate existing content
   - If the proposal supersedes something already on the page, replace it
   - Preserve existing content that the proposal doesn't address
4. Ensure the proposal's citation is included: the content should contain `[[source:811302f6-0be7-435c-b844-910cc9a21b67/31]]`
5. Write the updated page to: `/home/user/intentional/wiki/pages/undefined.md`

After writing the page, delete the proposal file:
```
rm /home/user/intentional/state/staging/dry-run/specialist-functionality-external-link-fetching.json
```

Then run `bun run eval` to get the next action.
