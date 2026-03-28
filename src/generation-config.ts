/**
 * Generation pipeline configuration.
 *
 * Defines the ordered sequence of specialist passes for wiki generation.
 * Each level depends on the output of all levels above it — specialists
 * are given higher-level pages as context so lower-level pages are written
 * in terms of purpose, not just mechanics.
 *
 * Order matters: do not reorder without considering dependencies.
 */

export interface SpecialistLevel {
  /** Octowiki category this specialist writes to */
  category: string;
  /** Human-readable role name */
  role: string;
  /** What this specialist extracts from the conversation */
  focus: string;
  /** Categories from prior levels to load as context */
  contextFrom: string[];
  /** Signal types this specialist looks for */
  signalTypes: string[];
}

export const GENERATION_ORDER: SpecialistLevel[] = [
  {
    category: "functionality",
    role: "User Researcher",
    focus: "How humans and agents interact with the system. What they can do, what they expect, what success looks like from their perspective. Not how it works — what it does for them.",
    contextFrom: [],
    signalTypes: ["decision", "ratification", "open-question"],
  },
  {
    category: "architecture",
    role: "Architect",
    focus: "How the system is structured to meet the functional needs above. Component boundaries, responsibilities, relationships, key design constraints and trade-offs. Must be traceable to functionality.",
    contextFrom: ["functionality"],
    signalTypes: ["decision", "ratification", "rejection", "clarification"],
  },
  {
    category: "pipeline",
    role: "Pipeline Specialist",
    focus: "How data and control flow through the system. Transformation steps, trigger conditions, error handling, retry behaviour. Must be traceable to architecture.",
    contextFrom: ["functionality", "architecture"],
    signalTypes: ["decision", "ratification", "clarification"],
  },
  {
    category: "data-model",
    role: "Data Modeller",
    focus: "Schemas, types, file formats, storage structures. What fields exist and why — each field should be traceable to a pipeline or architectural need.",
    contextFrom: ["functionality", "architecture", "pipeline"],
    signalTypes: ["decision", "ratification", "clarification"],
  },
  {
    category: "algorithms",
    role: "Algorithm Specialist",
    focus: "Computational approaches, strategies, heuristics. How the system computes its outputs. Must be grounded in the data model and traceable to functional needs — not just mechanics.",
    contextFrom: ["functionality", "architecture", "pipeline", "data-model"],
    signalTypes: ["decision", "ratification", "clarification"],
  },
  {
    category: "testing",
    role: "Test Specialist",
    focus: "What correct behaviour looks like in verifiable form. Invariants, characterisation tests, coverage gaps. Derived from functionality and architecture — not from implementation.",
    contextFrom: ["functionality", "architecture"],
    signalTypes: ["decision", "ratification", "open-question"],
  },
];

/**
 * For a given category, return all categories that must be generated first.
 */
export function getDependencies(category: string): string[] {
  const level = GENERATION_ORDER.find((l) => l.category === category);
  return level?.contextFrom ?? [];
}

/**
 * Return the full ordered sequence of categories.
 */
export function getGenerationSequence(): string[] {
  return GENERATION_ORDER.map((l) => l.category);
}
