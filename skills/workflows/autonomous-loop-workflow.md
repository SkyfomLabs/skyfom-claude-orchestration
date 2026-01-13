# Autonomous Loop Workflow

All Skyfom agents implement autonomous loop execution with circuit breaker safety and exit detection.

## Loop Execution Pattern

### 1. Initialize Loop State

When starting a task:
```
Loop iteration: 1
Circuit state: closed
Progress tracking: enabled
Exit signal: false
```

### 2. Execute Task Work

Perform task implementation:
- Write code
- Run tests
- Create/update PR
- Fix issues
- Respond to code review

### 3. Check Progress & Exit Condition

After each iteration, evaluate:

**Exit Condition (Dual-Condition Gate)**:
- ✅ **Completion Indicators** (need >= 2):
  - "Task complete"
  - "Implementation finished"
  - "PR merged"
  - "All done"
  - "No more work"
  - "Ready for review/merge"

- ✅ **Exit Signal** (must be explicit):
  ```
  EXIT_SIGNAL: true
  ```

**Continue If**:
- Work remains incomplete
- Tests failing
- Code review has P0/P1 issues
- CI/CD checks failing
- Blockers exist but can be resolved

### 4. Report Loop Status

At end of each iteration, output:

```markdown
## Loop Status

**Iteration**: [current loop number]
**Progress**: [describe what was accomplished this iteration]
**Circuit State**: [closed | half_open | open]
**Task Status**: [in_progress | blocked | complete]

### Completion Indicators
- [x] Task complete
- [x] All tests passing
- [x] PR approved and merged

### Exit Decision
EXIT_SIGNAL: [true | false]

**Reason**: [why continuing or exiting]
```

### 5. Circuit Breaker Protection

**No Progress Detection** (max 5 consecutive loops):
- Hash output to detect meaningful changes
- If no progress for 5 loops → Circuit opens
- **Action**: Report blockage, escalate to human

**Repeated Error Detection** (max 10 consecutive loops):
- Track error patterns
- If same error for 10 loops → Circuit opens
- **Action**: Report persistent error, escalate to human

### 6. Rate Limit Handling

If API rate limit hit:
```
⏳ Rate limited. Retrying in 60 seconds (1m)
⏳ Rate limited. Retrying in 59 seconds...
...
✅ Rate limit cleared, resuming work
```

**Behavior**:
- Auto-retry every 60 seconds
- Infinite retries until limit clears
- Display countdown to user
- No manual intervention required

## Loop Continuation Logic

```
while (task not complete) {
  1. Execute task work
  2. Check completion indicators
  3. Update progress hash
  4. Detect errors
  5. Check circuit breaker

  if (exitSignal && completionIndicators >= 2) {
    break; // Task complete
  }

  if (circuitBreakerOpen) {
    escalateToHuman();
    break;
  }

  if (rateLimitHit) {
    waitForRateLimit(); // Auto-retry every 60s
    continue;
  }

  // Continue next iteration
}
```

## Exit Signal Requirements

**To exit loop, agent MUST output**:

```markdown
## Task Complete

Task has been successfully completed:
- [List what was accomplished]
- [All acceptance criteria met]
- [PR merged / All tests passing / etc.]

EXIT_SIGNAL: true
```

**IMPORTANT**: Do NOT set `EXIT_SIGNAL: true` unless:
1. Task is truly 100% complete
2. All acceptance criteria met
3. No blocking issues remain
4. At least 2 completion indicators present

## Example Loop Iterations

### Iteration 1 - Initial Implementation
```markdown
## Loop Status

**Iteration**: 1
**Progress**: Implemented user authentication endpoints, wrote unit tests
**Circuit State**: closed
**Task Status**: in_progress

### Completion Indicators
- [ ] Task complete
- [ ] All tests passing (2 tests failing)
- [ ] PR created

### Exit Decision
EXIT_SIGNAL: false

**Reason**: Tests failing, need to fix validation logic
```

### Iteration 2 - Fix Tests
```markdown
## Loop Status

**Iteration**: 2
**Progress**: Fixed validation logic, all tests now passing
**Circuit State**: closed
**Task Status**: in_progress

### Completion Indicators
- [ ] Task complete
- [x] All tests passing
- [x] PR created and pushed

### Exit Decision
EXIT_SIGNAL: false

**Reason**: Waiting for code review
```

### Iteration 3 - Code Review Fixes
```markdown
## Loop Status

**Iteration**: 3
**Progress**: Applied code review suggestions, improved error handling
**Circuit State**: closed
**Task Status**: in_progress

### Completion Indicators
- [ ] Task complete
- [x] All tests passing
- [x] PR updated with review fixes

### Exit Decision
EXIT_SIGNAL: false

**Reason**: Waiting for re-review and CI/CD
```

### Iteration 4 - Complete
```markdown
## Loop Status

**Iteration**: 4
**Progress**: PR approved and merged to main
**Circuit State**: closed
**Task Status**: complete

### Completion Indicators
- [x] Task complete
- [x] All tests passing
- [x] PR approved and merged
- [x] CI/CD checks passed

### Exit Decision
EXIT_SIGNAL: true

**Reason**: Task fully complete, all acceptance criteria met, PR merged successfully
```

## Circuit Breaker Examples

### No Progress Example
```markdown
## Loop Status

**Iteration**: 5
**Progress**: No changes - still stuck on same error
**Circuit State**: open
**Task Status**: blocked

### Issue
Same dependency installation error for 5 consecutive loops:
"Cannot resolve package '@types/react@18.0.0'"

### Circuit Breaker
**Status**: OPEN (5 consecutive loops with no progress)
**Action**: Escalating to human for manual intervention

Possible solutions:
1. Check if package exists in registry
2. Try alternative package version
3. Review package.json for conflicts
```

### Repeated Error Example
```markdown
## Loop Status

**Iteration**: 10
**Progress**: Multiple attempts to fix, same error persists
**Circuit State**: open
**Task Status**: blocked

### Issue
TypeScript compilation error repeating for 10 loops:
"Type 'string' is not assignable to type 'number'"

### Circuit Breaker
**Status**: OPEN (10 consecutive loops with repeated error)
**Action**: Escalating to human for code review

The error suggests a fundamental type mismatch that requires
architectural decision or human review.
```

## Integration with PM Orchestrator

- PM spawns agent with task
- Agent loops autonomously until EXIT_SIGNAL
- PM monitors agent loop state
- PM escalates if circuit opens
- PM claims next task when agent exits

## State Tracking

Agent loop state tracked in `.claude/state/agents.json`:
```json
{
  "id": "agent-abc123",
  "loopState": {
    "currentLoop": 4,
    "noProgressLoops": 0,
    "repeatedErrorLoops": 0,
    "lastProgress": "a3f5b2c8",
    "circuitState": "closed",
    "exitSignal": false,
    "completionIndicators": ["PR merged", "All tests passing"]
  }
}
```

## Key Principles

1. **Autonomous by Default**: Loop until task complete, no human approval between iterations
2. **Safety First**: Circuit breaker prevents infinite loops and API exhaustion
3. **Explicit Exit**: Require EXIT_SIGNAL + completion indicators to exit
4. **Progress Tracking**: Hash-based detection of meaningful changes
5. **Rate Limit Resilience**: Auto-retry every 60s until API access restored
6. **Escalation Path**: Circuit breaker opens → escalate to human → manual recovery
