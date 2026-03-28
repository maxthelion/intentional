/**
 * Reads next-action.json (type: "apply") and prints a structured apply prompt.
 * The agent follows this to write or update a wiki page with the proposal content.
 *
 * Usage: bun src/apply-prompt.ts
 */

import { readFile } from "fs/promises";
import { join } from "path";
import type { NextAction, WriteProposal, MessagePair } from "./types";

const NEXT_ACTION_PATH = join(process.cwd(), "state", "next-action.json");

async function loadCurrentPage(pagePath: string | null): Promise<string> {
  if (!pagePath) return "(page does not exist yet — create it)";
  try {
    return await readFile(pagePath, "utf-8");
  } catch {
    return "(page does not exist yet — create it)";
  }
}

async function loadOriginalPair(
  sessionPath: string,
  seq: number
): Promise<MessagePair | null> {
  try {
    const raw = await readFile(sessionPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const pair = JSON.parse(trimmed) as MessagePair;
        if (pair.seq === seq) return pair;
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const raw = await readFile(NEXT_ACTION_PATH, "utf-8");
  const action = JSON.parse(raw) as NextAction;

  if (action.type !== "apply") {
    console.log(`Nothing to apply. Next action type: ${action.type}`);
    process.exit(0);
  }

  const { proposal, proposal_path, current_page_path, session_path } = action;
  const currentPage = await loadCurrentPage(current_page_path);
  const originalPair = session_path
    ? await loadOriginalPair(session_path, proposal.provenance.seq)
    : null;

  const targetPath = current_page_path ?? join(process.cwd(), "wiki", "pages", `${proposal.section}.md`);

  const prompt = `# Apply Proposal to Wiki

Apply the following proposal to the wiki. Your job is to write or update a wiki page so it accurately reflects the proposal content.

## Proposal

\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`

## Current Page (${targetPath})

${currentPage}

${originalPair ? `## Original Conversation Pair (for additional context)

**Agent (seq=${originalPair.seq}):** ${originalPair.agent}

**User:** ${originalPair.user}` : ""}

## Instructions

1. Read the proposal content carefully.
2. Read the current page (if it exists).
3. Update the page to incorporate the proposal:
   - If the page doesn't exist, create it with appropriate frontmatter (title, category: ${proposal.section}, tags, summary, last-modified-by: agent)
   - If the page exists, find the right place to add or update content — do not duplicate existing content
   - If the proposal supersedes something already on the page, replace it
   - Preserve existing content that the proposal doesn't address
4. Ensure the proposal's citation is included: the content should contain \`[[source:${proposal.provenance.session_id}/${proposal.provenance.seq}]]\`
5. Write the updated page to: \`${targetPath}\`

After writing the page, delete the proposal file:
\`\`\`
rm ${proposal_path}
\`\`\`

Then run \`bun run eval\` to get the next action.
`;

  console.log(prompt);
}

main().catch((err) => {
  console.error("apply-prompt failed:", err);
  process.exit(1);
});
