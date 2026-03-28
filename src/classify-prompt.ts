/**
 * Reads next-action.json and prints a structured classify prompt to stdout.
 * The agent runs this after eval to get its task.
 *
 * Usage: bun src/classify-prompt.ts
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";
import type { NextAction, MessagePair } from "./types";

const NEXT_ACTION_PATH = join(process.cwd(), "state", "next-action.json");
const WIKI_PAGES = join(process.cwd(), "wiki", "pages");

async function loadWikiContext(): Promise<string> {
  let pages: string[];
  try {
    pages = await readdir(WIKI_PAGES);
  } catch {
    return "(no wiki pages found)";
  }

  const sections: string[] = [];
  for (const file of pages.sort()) {
    if (!file.endsWith(".md") || file === "category-taxonomy.md") continue;
    try {
      const content = await readFile(join(WIKI_PAGES, file), "utf-8");
      sections.push(`### ${file.replace(".md", "")}\n${content}`);
    } catch {}
  }
  return sections.join("\n\n---\n\n");
}

function formatPair(pair: MessagePair, label: string): string {
  return `**${label} (seq=${pair.seq}, ${pair.timestamp})**\nAgent: ${pair.agent}\nUser: ${pair.user}`;
}

async function main() {
  const raw = await readFile(NEXT_ACTION_PATH, "utf-8");
  const action = JSON.parse(raw) as NextAction;

  if (action.type !== "classify") {
    console.log(`Nothing to classify. Next action type: ${action.type}`);
    process.exit(0);
  }

  const wikiContext = await loadWikiContext();
  const windowText =
    action.rolling_window.length > 0
      ? action.rolling_window.map((p, i) => formatPair(p, `Prior pair ${i + 1}`)).join("\n\n")
      : "(this is the first pair in the session)";

  const prompt = `# Triage Classification Task

You are the triage classifier for the **intentional** project.

Your task: classify the message pair below, extract all signals, and produce one or more write proposals as structured JSON. A single pair may contain multiple distinct signals — produce one proposal per signal.

## Current Octowiki Context

${wikiContext}

---

## Rolling Window (prior pairs for correction/ratification context)

${windowText}

---

## Pair to Classify

${formatPair(action.pair, "Current pair")}

---

## Instructions

### External links

Before classifying, scan both the agent turn and user turn for URLs. If any are present, fetch them:

\`\`\`bash
curl -s <url>
\`\`\`

Read the content and consider whether it is relevant context for understanding the pair. Blog posts, documentation, and articles shared during a conversation often directly inform the decisions being made — treat their content as background context for classification, even if the pair itself only contains the URL. Do not discard a pair solely because the user turn is a URL — follow it first.

### Detectors

Run each detector in order. A pair may trigger multiple detectors.

**Detectors:**
1. **DetectRatification** — Did the user confirm something the agent proposed? Look for affirmatives ("yes", "that's right", "exactly", "looks good") following a substantive agent proposal.
2. **DetectDecision** — Was something concluded or resolved? A direction chosen, an approach agreed on?
3. **DetectRejection** — Was a direction explicitly ruled out with reasoning?
4. **DetectOpenQuestion** — Was something flagged as unresolved or needing more thought?
5. **DetectClarification** — Did something vague become precise?

**For each signal detected**, produce a write proposal:

\`\`\`json
{
  "type": "decision" | "ratification" | "rejection" | "open-question" | "clarification",
  "project": "intentional",
  "section": "<target wiki section, e.g. 'inbox', 'triage-behaviour-tree'>",
  "topic": "<short normalised identifier for what this is about, e.g. 'inbox-structure', 'bt-invariants', 'pipeline-stages'>",
  "content": "<markdown content to write to the wiki, must end with a citation: [[source:${action.session_id}/${action.seq}]]>",
  "confidence": <0.0–1.0>,
  "provenance": {
    "session_id": "${action.session_id}",
    "seq": ${action.seq},
    "raw_agent": "<relevant excerpt from agent turn>",
    "raw_user": "<relevant excerpt from user turn>",
    "what_was_ratified": "<if type=ratification, extract the substance from the agent turn>"
  }
}
\`\`\`

**Citation format:** Every piece of content written to the wiki must end with a citation in the format \`[[source:session_id/seq]]\`. This makes the provenance chain visible in the wiki itself — any claim can be traced back to the conversation pair that established it.

If no signals are detected, output:
\`\`\`json
{ "type": "discard", "reason": "<why this pair has no signal worth recording>" }
\`\`\`

**After producing proposals**, write each one as a JSON file to \`state/staging/dry-run/\` named \`${action.session_id}-seq${action.seq}-<index>.json\`.

Then run:
\`\`\`
bun run mark-processed --session ${action.session_id} --seq ${action.seq}
\`\`\`

Then run \`bun run eval\` to get the next pair.
`;

  console.log(prompt);
}

main().catch((err) => {
  console.error("classify-prompt failed:", err);
  process.exit(1);
});
