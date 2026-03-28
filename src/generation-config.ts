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
  /** One-line persona description */
  persona: string;
  /** What this specialist extracts from the conversation */
  focus: string;
  /** Explicitly what does NOT belong in this category */
  exclude: string;
  /** Categories from prior levels to load as context */
  contextFrom: string[];
  /** Signal types this specialist looks for */
  signalTypes: string[];
}

export const GENERATION_ORDER: SpecialistLevel[] = [
  {
    category: "functionality",
    role: "User Researcher",
    persona: "You care only about outcomes and expectations — what people and agents want to achieve, and whether they can. You are deliberately ignorant of implementation.",
    focus: "What humans and agents can do with the system. What they expect. What success looks like from their perspective. The scope boundary — what this system is not. Captured as capabilities, outcomes, and user-facing behaviours.",
    exclude: "Anything that describes a mechanism rather than an outcome. If a sentence could only be understood by someone building the system rather than someone using it, it belongs in a lower-level category.",
    contextFrom: [],
    signalTypes: ["decision", "ratification", "open-question"],
  },
  {
    category: "architecture",
    role: "Architect",
    persona: "You care about structure and boundaries — what the components are, what each is responsible for, and how they relate. You reason in terms of responsibilities and interfaces, not code.",
    focus: "Component boundaries, responsibilities, relationships, key design constraints and trade-offs. Why the system is structured this way. Must be traceable to the functional needs in the functionality pages.",
    exclude: "Specific file formats, field names, byte-level details (those go in data-model). Step-by-step processing sequences (those go in pipeline). User-facing capabilities (those go in functionality).",
    contextFrom: ["functionality"],
    signalTypes: ["decision", "ratification", "rejection", "clarification"],
  },
  {
    category: "pipeline",
    role: "Pipeline Specialist",
    persona: "You care about flow — how information moves, transforms, and triggers actions. You think in terms of inputs, outputs, and what happens at each stage.",
    focus: "How data and control flow through the system. Each transformation stage: input, output, responsibility, invariants. Trigger conditions, error handling, retry behaviour. Must be traceable to architecture.",
    exclude: "User-facing capabilities and outcomes. Internal field-level detail. Stick to stage responsibilities and the flow between them.",
    contextFrom: ["functionality", "architecture"],
    signalTypes: ["decision", "ratification", "clarification"],
  },
  {
    category: "data-model",
    role: "Data Modeller",
    persona: "You care about structure and meaning of data — what fields exist, what values they hold, and why each one is necessary. Every field should earn its place.",
    focus: "Schemas, types, file formats, storage structures. Field names, types, valid values, and the reason each field exists. Must be traceable to a pipeline or architectural need.",
    exclude: "Structural decisions and rationale. User-facing capabilities. Computational logic. Stick to what the data looks like and why each element is necessary.",
    contextFrom: ["functionality", "architecture", "pipeline"],
    signalTypes: ["decision", "ratification", "clarification"],
  },
  {
    category: "algorithms",
    role: "Algorithm Specialist",
    persona: "You care about how the system computes its outputs — the strategies, heuristics, and decision logic. You always ground algorithms in the human need they serve.",
    focus: "Computational approaches, classification strategies, conflict resolution logic, confidence scoring. How the system decides what to do. Must be grounded in the data model and traceable to functional needs.",
    exclude: "Data structures and field definitions. Orchestration and flow. User outcomes. Every algorithm described must be anchored to a functional purpose stated in the conversation.",
    contextFrom: ["functionality", "architecture", "pipeline", "data-model"],
    signalTypes: ["decision", "ratification", "clarification"],
  },
  {
    category: "testing",
    role: "Test Specialist",
    persona: "You care about what 'correct' looks like in verifiable form. You derive tests from stated behaviour, not from implementation. You are looking for invariants — things that must always be true.",
    focus: "Invariants that must hold. What correct behaviour looks like. Coverage gaps — things that should be tested but aren't. Derived from functionality and architecture, not from implementation details.",
    exclude: "Implementation detail. Tests should verify stated behaviour and invariants, not internal mechanics.",
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
