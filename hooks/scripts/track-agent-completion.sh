#!/bin/bash
# Track agent completion and update metrics

input=$(cat)

# Extract agent info from Task tool output
agent_id=$(echo "$input" | jq -r '.tool_use_id // empty')
subagent_type=$(echo "$input" | jq -r '.tool_input.subagent_type // empty')

if [ -z "$agent_id" ] || [ -z "$subagent_type" ]; then
  exit 0
fi

STATE_DIR="${CLAUDE_PROJECT_DIR}/.claude/state"
AGENTS_FILE="$STATE_DIR/agents.json"
EVENTS_FILE="$STATE_DIR/events.jsonl"
ORCH_FILE="$STATE_DIR/orchestration.json"

# Log completion event
timestamp=$(date -Iseconds)
echo "{\"type\":\"agent_completed\",\"timestamp\":\"$timestamp\",\"agent_id\":\"$agent_id\",\"subagent_type\":\"$subagent_type\"}" >> "$EVENTS_FILE" 2>/dev/null || true

# Update agent status in agents.json
if [ -f "$AGENTS_FILE" ]; then
  python3 - "$agent_id" "$AGENTS_FILE" <<'PYTHON_EOF'
import sys
import json

agent_id = sys.argv[1]
agents_file = sys.argv[2]

try:
    with open(agents_file, 'r') as f:
        agents = json.load(f)

    if not isinstance(agents, list):
        agents = []

    # Update or add agent
    found = False
    for agent in agents:
        if agent.get('id') == agent_id:
            agent['status'] = 'completed'
            agent['completedAt'] = sys.argv[0]  # timestamp
            found = True
            break

    if not found:
        agents.append({
            'id': agent_id,
            'status': 'completed',
            'completedAt': sys.argv[0]
        })

    with open(agents_file, 'w') as f:
        json.dump(agents, f, indent=2)
except:
    pass
PYTHON_EOF
fi

exit 0
