#!/bin/bash
# Intentional agent orchestrator.
#
# Checks for a trigger file, acquires a lock, spins up claude -p in a
# git worktree, waits for completion, then cleans up.
#
# Usage:
#   ./scripts/run-agent.sh            # run if triggered
#   ./scripts/run-agent.sh --force    # run regardless of trigger file
#
# To trigger a run:
#   touch state/trigger && git add state/trigger && git commit -m "trigger agent run"
#
# Set up as a cron job:
#   */15 * * * * cd /path/to/intentional && git pull && ./scripts/run-agent.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_FILE="$REPO_ROOT/state/agent-running.lock"
TRIGGER_FILE="$REPO_ROOT/state/trigger"
WORKTREE_BASE="/tmp/intentional-agent"

cd "$REPO_ROOT"
mkdir -p state

# Check trigger (unless --force)
if [[ "${1:-}" != "--force" ]]; then
  if [ ! -f "$TRIGGER_FILE" ]; then
    echo "No trigger file found. Create state/trigger to request a run."
    exit 0
  fi
fi

# Prevent concurrent runs
if [ -f "$LOCK_FILE" ]; then
  echo "Agent already running ($(cat $LOCK_FILE)). Exiting."
  exit 0
fi

# Check there's actually work to do
bun run eval > /dev/null 2>&1
ACTION_TYPE=$(cat state/next-action.json | python3 -c "import sys,json; print(json.load(sys.stdin)['type'])")
if [ "$ACTION_TYPE" = "idle" ]; then
  echo "Tree is idle — nothing to do."
  rm -f "$TRIGGER_FILE"
  exit 0
fi

echo "Starting agent run (action: $ACTION_TYPE)"

# Acquire lock
BRANCH="claude/local-$(date +%Y%m%d-%H%M%S)"
echo "$BRANCH" > "$LOCK_FILE"

# Remove trigger
rm -f "$TRIGGER_FILE"

# Create worktree on a new branch
WORKTREE_PATH="$WORKTREE_BASE-$(date +%s)"
git worktree add "$WORKTREE_PATH" -b "$BRANCH" 2>/dev/null

cleanup() {
  echo "Cleaning up..."
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
  rm -f "$LOCK_FILE"
}
trap cleanup EXIT

# Run agent in worktree
echo "Running agent on branch $BRANCH in $WORKTREE_PATH"
cd "$WORKTREE_PATH"

claude --print "$(cat SCHEDULED_PROMPT.md)"

echo "Agent run complete."
