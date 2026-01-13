#!/bin/bash
# Initialize orchestration environment

set -e

STATE_DIR="${CLAUDE_PROJECT_DIR}/.claude/state"
mkdir -p "$STATE_DIR"

# Initialize orchestration.json if doesn't exist
ORCH_FILE="$STATE_DIR/orchestration.json"
if [ ! -f "$ORCH_FILE" ]; then
  cat > "$ORCH_FILE" <<'EOF'
{
  "version": "1.1.0",
  "startedAt": "",
  "phase": "idle",
  "status": "idle",
  "epicId": null,
  "config": {
    "maxParallelAgents": 7,
    "maxCodeReviewLoops": 50,
    "maxTokensPerAgent": 200000,
    "tokenWarningThreshold": 160000,
    "autoRestart": false,
    "humanApprovalRequired": true,
    "autonomousMode": true,
    "circuitBreaker": {
      "maxNoProgressLoops": 5,
      "maxRepeatedErrorLoops": 10,
      "enabled": true
    },
    "rateLimiter": {
      "enabled": true,
      "retryDelaySeconds": 60,
      "maxRetries": -1
    }
  },
  "agents": [],
  "tasks": [],
  "metrics": {
    "totalAgentsSpawned": 0,
    "totalTasksCompleted": 0,
    "totalTokensUsed": 0,
    "averageReviewLoops": 0,
    "totalLoops": 0,
    "circuitBreakerTrips": 0,
    "rateLimitHits": 0,
    "averageLoopsPerTask": 0
  }
}
EOF
fi

# Initialize empty files
touch "$STATE_DIR/agents.json" 2>/dev/null || true
touch "$STATE_DIR/tasks.json" 2>/dev/null || true
touch "$STATE_DIR/events.jsonl" 2>/dev/null || true

# Set environment variables for session
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export SKYFOM_ORCHESTRATION=active' >> "$CLAUDE_ENV_FILE"
  echo "export SKYFOM_STATE_DIR=$STATE_DIR" >> "$CLAUDE_ENV_FILE"

  # Load .env if exists
  if [ -f "${CLAUDE_PROJECT_DIR}/.env" ]; then
    set -a
    source "${CLAUDE_PROJECT_DIR}/.env"
    set +a
  fi
fi

# Log session start
timestamp=$(date -Iseconds)
echo "{\"type\":\"session_start\",\"timestamp\":\"$timestamp\"}" >> "$STATE_DIR/events.jsonl"

exit 0
