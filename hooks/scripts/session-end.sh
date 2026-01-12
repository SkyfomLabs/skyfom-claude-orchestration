#!/bin/bash
# Save orchestration state and generate session report

STATE_DIR="${CLAUDE_PROJECT_DIR}/.claude/state"
EVENTS_FILE="$STATE_DIR/events.jsonl"

# Log session end
timestamp=$(date -Iseconds)
echo "{\"type\":\"session_end\",\"timestamp\":\"$timestamp\"}" >> "$EVENTS_FILE" 2>/dev/null || true

# Generate session report
REPORT_FILE="$STATE_DIR/session-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" <<EOF
# Skyfom Orchestration Session Report

**Generated**: $timestamp

## Session Summary

$(cat "$STATE_DIR/orchestration.json" 2>/dev/null | jq -r '
"**Status**: \(.status)
**Phase**: \(.phase)
**Epic**: \(.epicId // "N/A")

### Metrics
- Agents Spawned: \(.metrics.totalAgentsSpawned)
- Tasks Completed: \(.metrics.totalTasksCompleted)
- Total Tokens: \(.metrics.totalTokensUsed)
- Avg Review Loops: \(.metrics.averageReviewLoops)
"' || echo "No orchestration data")

## Active Agents

$(cat "$STATE_DIR/agents.json" 2>/dev/null | jq -r '
if . == null or . == [] then
  "No active agents"
else
  .[] | "- **\(.id)** (\(.agentType)): \(.status)"
end
' || echo "No agent data")

## Event Log (Last 20)

$(tail -20 "$EVENTS_FILE" 2>/dev/null | jq -r '"\(.timestamp) - \(.type)"' || echo "No events")

EOF

echo "Session report saved: $REPORT_FILE" >&2

exit 0
