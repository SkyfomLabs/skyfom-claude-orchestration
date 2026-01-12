#!/usr/bin/env python3
"""Validate task spawning - check agent slots available"""

import json
import sys
from pathlib import Path

def load_state():
    """Load orchestration state"""
    state_file = Path.cwd() / '.claude' / 'state' / 'orchestration.json'
    if not state_file.exists():
        return None

    with open(state_file) as f:
        return json.load(f)

def count_active_agents():
    """Count currently active agents"""
    agents_file = Path.cwd() / '.claude' / 'state' / 'agents.json'
    if not agents_file.exists():
        return 0

    try:
        with open(agents_file) as f:
            agents = json.load(f)
            if not isinstance(agents, list):
                return 0
            return len([a for a in agents if a.get('status') in ['running', 'spawning', 'waiting']])
    except:
        return 0

try:
    input_data = json.load(sys.stdin)
    tool_name = input_data.get('tool_name', '')

    if tool_name != 'Task':
        sys.exit(0)

    # Load state
    state = load_state()
    if not state:
        sys.exit(0)  # No state file, allow

    # Check if orchestration is active
    if state.get('status') == 'paused':
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": "Orchestration is paused. Run /skyfom-orchestrate to resume."
            }
        }
        print(json.dumps(output))
        sys.exit(0)

    # Check agent slots
    max_agents = state.get('config', {}).get('maxParallelAgents', 7)
    active_count = count_active_agents()

    if active_count >= max_agents:
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": f"Maximum parallel agents ({max_agents}) reached. Currently active: {active_count}. Wait for agents to complete."
            }
        }
        print(json.dumps(output))
        sys.exit(0)

    # Allow task spawn
    sys.exit(0)

except Exception as e:
    print(f"Validation error: {e}", file=sys.stderr)
    sys.exit(1)
