#!/usr/bin/env python3
"""Validate bash commands for security"""

import json
import sys
import re

DANGEROUS_PATTERNS = [
    (r'rm\s+-rf\s+/', 'Deleting from root directory'),
    (r':\(\)\{', 'Fork bomb detected'),
    (r'mkfs\.', 'Filesystem formatting'),
    (r'dd\s+if=.*of=/dev/', 'Direct disk write'),
    (r'>\s*/dev/sd[a-z]', 'Direct disk write'),
    (r'curl.*\|\s*bash', 'Piping remote script to bash'),
    (r'wget.*\|\s*sh', 'Piping remote script to shell'),
]

try:
    input_data = json.load(sys.stdin)
    tool_name = input_data.get('tool_name', '')
    tool_input = input_data.get('tool_input', {})

    if tool_name != 'Bash':
        sys.exit(0)

    command = tool_input.get('command', '')

    # Check dangerous patterns
    for pattern, description in DANGEROUS_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": f"Dangerous command detected: {description}. Command blocked for safety."
                }
            }
            print(json.dumps(output))
            sys.exit(0)

    # Allow command
    sys.exit(0)

except Exception as e:
    print(f"Validation error: {e}", file=sys.stderr)
    sys.exit(1)
