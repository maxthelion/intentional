// A single message pair from the inbox JSONL
export interface MessagePair {
  session_id: string;
  repo: string;
  seq: number;
  timestamp: string;
  agent: string;
  user: string;
  processed: boolean;
}

// A session file with its path and pairs
export interface Session {
  path: string;
  session_id: string;
  pairs: MessagePair[];
}

// Specialist generation progress
export interface SpecialistProgress {
  completed: string[]; // categories completed in order
  mode: "specialist" | "triage" | null; // current pipeline mode
}

// Output of the deterministic tree evaluator
export type NextAction =
  | {
      type: "classify";
      session_id: string;
      session_path: string;
      seq: number;
      pair: MessagePair;
      rolling_window: MessagePair[]; // prior N pairs for correction/ratification context
    }
  | {
      type: "apply";
      proposal_path: string;
      proposal: WriteProposal;
      current_page_path: string | null; // null if page doesn't exist yet
      session_path: string; // path to done/ session file for provenance lookback
    }
  | {
      type: "specialist";
      category: string;
      role: string;
      context_categories: string[]; // prior levels to load as context
    }
  | {
      type: "review-staging";
      proposal_count: number;
      staging_path: string;
    }
  | {
      type: "idle";
      reason: string;
    };

// A write proposal produced by the classifier agent
export interface WriteProposal {
  id: string; // {session_id}-{seq}-{index}
  type: "decision" | "ratification" | "rejection" | "open-question" | "clarification" | "discard";
  project: string;
  section: string; // target Octowiki section
  topic: string; // short normalised identifier e.g. "inbox-structure", "bt-invariants"
  content: string; // markdown, must include [[source:session_id/seq]] citation
  confidence: number; // 0–1
  provenance: {
    session_id: string;
    seq: number;
    raw_agent: string;
    raw_user: string;
    what_was_ratified?: string; // for ratification type only
  };
  dry_run: boolean;
  created_at: string;
}
