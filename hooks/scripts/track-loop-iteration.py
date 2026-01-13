#!/usr/bin/env python3
"""
Track loop iterations and circuit breaker state
Called after each agent iteration
"""

import json
import sys
import os
import re
from datetime import datetime
from pathlib import Path

def load_state():
    """Load orchestration state"""
    state_file = Path(os.environ['CLAUDE_PROJECT_DIR']) / '.claude' / 'state' / 'orchestration.json'
    if not state_file.exists():
        return None

    with open(state_file, 'r') as f:
        return json.load(f)

def save_state(state):
    """Save orchestration state"""
    state_file = Path(os.environ['CLAUDE_PROJECT_DIR']) / '.claude' / 'state' / 'orchestration.json'
    with open(state_file, 'w') as f:
        json.dump(state, f, indent=2)

def log_event(event_type, data):
    """Log event to events.jsonl"""
    events_file = Path(os.environ['CLAUDE_PROJECT_DIR']) / '.claude' / 'state' / 'events.jsonl'
    event = {
        'type': event_type,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        **data
    }
    with open(events_file, 'a') as f:
        f.write(json.dumps(event) + '\n')

def detect_exit_signal(output):
    """Detect EXIT_SIGNAL in agent output"""
    return bool(re.search(r'EXIT_SIGNAL:\s*true', output, re.IGNORECASE))

def detect_completion_indicators(output):
    """Detect completion indicator patterns"""
    patterns = [
        r'task\s+(is\s+)?complete',
        r'implementation\s+(is\s+)?finished',
        r'all\s+done',
        r'successfully\s+(completed|merged)',
        r'pr\s+(has\s+been\s+)?merged',
        r'no\s+(more|further)\s+(work|changes|tasks)',
        r'ready\s+for\s+(review|merge|deployment)',
        r'epic\s+(is\s+)?complete',
        r'phase\s+(is\s+)?complete',
        r'\bDONE\b',
    ]

    indicators = []
    for pattern in patterns:
        matches = re.findall(pattern, output, re.IGNORECASE)
        indicators.extend(matches)

    return len(indicators)

def main():
    # Read agent output from stdin
    agent_output = sys.stdin.read() if not sys.stdin.isatty() else ""

    # Load state
    state = load_state()
    if not state:
        sys.exit(0)  # No state yet, skip

    # Check if autonomous mode enabled
    if not state.get('config', {}).get('autonomousMode', True):
        sys.exit(0)  # Manual mode, skip loop tracking

    # Detect exit signal and completion indicators
    exit_signal = detect_exit_signal(agent_output)
    completion_count = detect_completion_indicators(agent_output)

    # Log loop iteration
    if exit_signal or completion_count > 0:
        log_event('loop_iteration', {
            'exitSignal': exit_signal,
            'completionIndicators': completion_count,
            'shouldExit': exit_signal and completion_count >= 2
        })

    # Check for circuit breaker triggers
    circuit_open_pattern = re.search(r'circuit\s+breaker.*open', agent_output, re.IGNORECASE)
    if circuit_open_pattern:
        log_event('circuit_breaker_open', {
            'reason': circuit_open_pattern.group(0)
        })

        # Update metrics
        state['metrics']['circuitBreakerTrips'] = state['metrics'].get('circuitBreakerTrips', 0) + 1
        save_state(state)

    # Check for rate limit
    rate_limit_pattern = re.search(r'rate\s+limit', agent_output, re.IGNORECASE)
    if rate_limit_pattern:
        log_event('rate_limit_hit', {
            'message': rate_limit_pattern.group(0)
        })

        # Update metrics
        state['metrics']['rateLimitHits'] = state['metrics'].get('rateLimitHits', 0) + 1
        save_state(state)

    # Check for progress/no progress
    no_progress_pattern = re.search(r'no\s+progress', agent_output, re.IGNORECASE)
    if no_progress_pattern:
        log_event('no_progress_detected', {
            'message': no_progress_pattern.group(0)
        })
    else:
        progress_pattern = re.search(r'progress:?\s+(.+)', agent_output, re.IGNORECASE)
        if progress_pattern:
            log_event('progress_detected', {
                'progress': progress_pattern.group(1)[:200]  # First 200 chars
            })

    sys.exit(0)

if __name__ == '__main__':
    main()
