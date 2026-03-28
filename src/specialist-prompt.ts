/**
 * Builds a specialist prompt for a given category level.
 *
 * Each specialist reads the full conversation and all wiki pages from
 * prior levels, then extracts signals relevant to their domain.
 *
 * Usage: bun src/specialist-prompt.ts --category functionality
 */

import { readFile, readdir, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { GENERATION_ORDER } from "./generation-config";
import type { MessagePair } from "./types";

const WIKI_PAGES = join(process.cwd(), "wiki", "pages");
const INBOX_DONE = join(process.cwd(), ".pi", "inbox", "done");

function parseArgs(): { category: string } {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--category");
  if (idx === -1) {
    console.error("Usage: bun src/specialist-prompt.ts --category <category>");
    process.exit(1);
  }
  return { category: args[idx + 1] };
}

async function loadSessionPairs(): Promise<MessagePair[]> {
  const files = await readdir(INBOX_DONE).catch(() => [] as string[]);
  const pairs: MessagePair[] = [];
  for (const file of files.sort()) {
    if (!file.endsWith(".jsonl")) continue;
    const raw = await readFile(join(INBOX_DONE, file), "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try { pairs.push(JSON.parse(trimmed)); } catch {}
    }
  }
  return pairs.sort((a, b) => a.seq - b.seq);
}

async function loadWikiCategory(category: string): Promise<string> {
  const files = await readdir(WIKI_PAGES).catch(() => [] as string[]);
  const pages: string[] = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const content = await readFile(join(WIKI_PAGES, file), "utf-8");
    if (content.includes(`category: ${category}`)) {
      pages.push(`### ${file.replace(".md", "")}\n${content}`);
    }
  }
  return pages.length > 0 ? pages.join("\n\n---\n\n") : "(none yet)";
}

const TASK_PATH = join(process.cwd(), "state", "current-task.md");

async function main() {
  const { category } = parseArgs();
  const level = GENERATION_ORDER.find((l) => l.category === category);
  if (!level) {
    console.error(`Unknown category: ${category}. Valid: ${GENERATION_ORDER.map(l => l.category).join(", ")}`);
    process.exit(1);
  }

  await mkdir(join(process.cwd(), "state"), { recursive: true });

  const pairs = await loadSessionPairs();

  // Load context from prior levels
  const contextSections: string[] = [];
  for (const dep of level.contextFrom) {
    const content = await loadWikiCategory(dep);
    contextSections.push(`## ${dep} pages (context)\n\n${content}`);
  }

  // Truncate long turns to keep prompt manageable
  const conversationText = pairs.map((p) => {
    const agent = p.agent.length > 600 ? p.agent.slice(0, 600) + "…" : p.agent;
    const user = p.user.length > 400 ? p.user.slice(0, 400) + "…" : p.user;
    return `**[seq=${p.seq} ${p.timestamp}]**\nAgent: ${agent}\nUser: ${user}`;
  }).join("\n\n---\n\n");

  const prompt = `# Specialist Pass — ${level.role} (${category})

You are the **${level.role}** reading this conversation to extract signals relevant to **${category}**.

## Your Focus

${level.focus}

## Your Constraints

- Only extract signals that fall within your domain (${category}). Do not write content that belongs to another level.
- Every claim you write must be grounded in the conversation — do not infer or elaborate beyond what was said.
- Every piece of content must end with a citation: \`[[source:session_id/seq]]\`
- Write for the next specialist who will read your output as context — be clear and precise, not exhaustive.
- If a concept belongs to a higher level (e.g. you are the data modeller and spot an architectural decision), note it as an open question rather than writing it yourself.

${contextSections.length > 0 ? `## Context from Prior Levels\n\n${contextSections.join("\n\n")}` : ""}

## Full Conversation

${conversationText}

---

## Instructions

Read the conversation above. For each signal you detect that falls within **${category}**, produce a write proposal:

\`\`\`json
{
  "type": "decision" | "ratification" | "rejection" | "open-question" | "clarification",
  "category": "${category}",
  "topic": "<short normalised identifier, e.g. '${category}-overview', '${category}-structure'>",
  "page": "<suggested wiki page slug>",
  "content": "<markdown content, must end with [[source:session_id/seq]]>",
  "confidence": <0.0–1.0>,
  "provenance": {
    "session_id": "<session_id>",
    "seq": <seq>,
    "raw_agent": "<relevant excerpt>",
    "raw_user": "<relevant excerpt>"
  }
}
\`\`\`

Write proposals to \`state/staging/dry-run/specialist-${category}-<topic>.json\`.

Produce one proposal per distinct topic. Do not combine multiple topics into one proposal.
`;

  await writeFile(TASK_PATH, prompt);
  console.log(`Task written to state/current-task.md (${prompt.length} chars)`);
  console.log(`Read it with: cat state/current-task.md`);
}

main().catch((err) => {
  console.error("specialist-prompt failed:", err);
  process.exit(1);
});
