# Project-Specific State Management

## Overview

Skyfom Orchestration uses **project-specific state directories** to ensure that each project maintains its own independent orchestration state. This prevents state conflicts when working on multiple projects simultaneously.

## How It Works

### State Directory Location

The state directory is always located at:
```
${CLAUDE_PROJECT_DIR}/.claude/state/
```

Where `CLAUDE_PROJECT_DIR` is an environment variable set by Claude Code that points to the current project's root directory.

### Example

```bash
# Project A
/Users/dev/project-a/.claude/state/
  ├── orchestration.json
  ├── agents.json
  ├── tasks.json
  └── events.jsonl

# Project B (completely separate)
/Users/dev/project-b/.claude/state/
  ├── orchestration.json
  ├── agents.json
  ├── tasks.json
  └── events.jsonl
```

## State Files

Each project maintains its own set of state files:

### `orchestration.json`
Main orchestration configuration and status.

```json
{
  "version": "1.1.0",
  "startedAt": "2026-01-13T10:00:00Z",
  "phase": "agent_spawning",
  "status": "running",
  "epicId": "bd-epic-123",
  "config": {
    "maxParallelAgents": 7,
    "maxCodeReviewLoops": 50,
    "maxTokensPerAgent": 200000,
    "tokenWarningThreshold": 160000,
    "idealTokensPerAgent": 100000,
    "autoRestart": false,
    "humanApprovalRequired": true
  },
  "agents": [],
  "tasks": [],
  "metrics": {
    "totalAgentsSpawned": 0,
    "totalTasksCompleted": 0,
    "totalTokensUsed": 0,
    "averageReviewLoops": 0
  }
}
```

### `agents.json`
Active agent tracking.

```json
[
  {
    "id": "agent-001",
    "agentType": "frontend",
    "skillName": "skyfom-frontend-developer",
    "status": "running",
    "taskId": "bd-123",
    "assignedAt": "2026-01-13T10:05:00Z",
    "tokenUsage": 45000,
    "outputFile": "/tmp/claude/project-a/tasks/agent-001.output"
  }
]
```

### `tasks.json`
Task progress tracking.

```json
[
  {
    "id": "bd-123",
    "type": "feature",
    "title": "Implement authentication",
    "status": "in_progress",
    "assignee": "agent-001",
    "prNumber": null,
    "ciStatus": null,
    "reviewLoops": 0,
    "tokenEstimate": 50000
  }
]
```

### `events.jsonl`
Event log (newline-delimited JSON).

```jsonl
{"type":"session_start","timestamp":"2026-01-13T10:00:00Z"}
{"type":"agent_spawned","agentId":"agent-001","taskId":"bd-123","timestamp":"2026-01-13T10:05:00Z"}
{"type":"task_completed","agentId":"agent-001","taskId":"bd-123","timestamp":"2026-01-13T11:00:00Z"}
```

## Benefits

### 1. Isolation
Each project has completely isolated state. Working on Project A doesn't affect Project B.

### 2. Concurrent Projects
You can run orchestration on multiple projects simultaneously without conflicts.

### 3. Clean State
Each project starts with a fresh state when first initialized.

### 4. Easy Cleanup
Deleting `.claude/state/` in a project removes all orchestration state for that project only.

## Session Lifecycle

### Initialization (SessionStart Hook)

When Claude Code starts in a project, the `session-start.sh` hook:

1. Creates the state directory: `${CLAUDE_PROJECT_DIR}/.claude/state/`
2. Initializes `orchestration.json` if it doesn't exist
3. Creates empty `agents.json`, `tasks.json`, and `events.jsonl` files
4. Sets environment variables:
   - `SKYFOM_ORCHESTRATION=active`
   - `SKYFOM_STATE_DIR=${CLAUDE_PROJECT_DIR}/.claude/state`
5. Logs session start to `events.jsonl`

### During Session

All skills and commands use `SKYFOM_STATE_DIR` or `${CLAUDE_PROJECT_DIR}/.claude/state` to read/write state.

### Session End (SessionEnd Hook)

The `session-end.sh` hook:
1. Saves final state
2. Generates session report
3. Logs session end to `events.jsonl`

## Working with Multiple Projects

### Scenario: Two Projects Simultaneously

```bash
# Terminal 1: Project A
cd /Users/dev/project-a
claude
/skyfom-orchestrate bd-epic-auth
# State: /Users/dev/project-a/.claude/state/

# Terminal 2: Project B (at the same time)
cd /Users/dev/project-b
claude
/skyfom-orchestrate bd-epic-payment
# State: /Users/dev/project-b/.claude/state/
```

Both orchestrations run independently with no conflicts.

## Viewing State

### For Current Project

```bash
# View orchestration status
cat .claude/state/orchestration.json

# View active agents
cat .claude/state/agents.json | jq

# View events
tail -f .claude/state/events.jsonl
```

### For Specific Project

```bash
# From anywhere
cat /Users/dev/my-project/.claude/state/orchestration.json

# Or use project path
PROJECT=/Users/dev/my-project
cat $PROJECT/.claude/state/orchestration.json
```

## State Persistence

State persists across Claude Code sessions for the same project:

```bash
# Session 1
cd /Users/dev/project-a
claude
/skyfom-orchestrate bd-epic-123
# Work in progress...
# Exit Claude Code

# Session 2 (later)
cd /Users/dev/project-a
claude
# State is preserved! Can resume or check status
cat .claude/state/orchestration.json
```

## Cleaning Up

### Remove State for Current Project

```bash
rm -rf .claude/state/
```

### Remove State for All Projects

```bash
# Find all state directories
find ~ -type d -path "*/.claude/state"

# Remove specific project
rm -rf /Users/dev/project-a/.claude/state/
```

## Environment Variables

These are set automatically by the SessionStart hook:

- `CLAUDE_PROJECT_DIR` - Project root directory (set by Claude Code)
- `SKYFOM_ORCHESTRATION` - Set to "active" when orchestration is available
- `SKYFOM_STATE_DIR` - Full path to state directory

## Best Practices

### 1. Don't Manually Edit State Files
Let the orchestration system manage state files. Manual edits can cause corruption.

### 2. Backup Important State
Before major operations:
```bash
cp -r .claude/state .claude/state.backup
```

### 3. Monitor State Size
State files can grow large with many events:
```bash
du -sh .claude/state/
```

### 4. Clean Old Events
Periodically trim old events:
```bash
# Keep only last 1000 events
tail -1000 .claude/state/events.jsonl > .claude/state/events.tmp
mv .claude/state/events.tmp .claude/state/events.jsonl
```

### 5. Gitignore State Directory
Add to `.gitignore`:
```gitignore
.claude/state/
```

State should not be committed to version control.

## Troubleshooting

### Issue: State Directory Not Created

**Solution**: Ensure `session-start.sh` is executable:
```bash
chmod +x .claude/hooks/scripts/session-start.sh
```

### Issue: Permission Denied

**Solution**: Check directory permissions:
```bash
ls -la .claude/
mkdir -p .claude/state
```

### Issue: Corrupt State

**Solution**: Delete and reinitialize:
```bash
rm -rf .claude/state
# Restart Claude Code to trigger session-start hook
```

### Issue: Wrong Project State

**Solution**: Verify you're in the correct directory:
```bash
pwd
echo $CLAUDE_PROJECT_DIR
```

## Technical Implementation

### Hook Script (`hooks/scripts/session-start.sh`)

```bash
#!/bin/bash
set -e

STATE_DIR="${CLAUDE_PROJECT_DIR}/.claude/state"
mkdir -p "$STATE_DIR"

# Initialize orchestration.json if doesn't exist
if [ ! -f "$STATE_DIR/orchestration.json" ]; then
  # Create initial state...
fi

# Set environment variables
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo "export SKYFOM_STATE_DIR=$STATE_DIR" >> "$CLAUDE_ENV_FILE"
fi
```

The key is using `${CLAUDE_PROJECT_DIR}` which is unique per project.

## Migration from Shared State

If you were using an older version with shared state:

### Before (Shared - Bad)
```
~/.claude/skyfom-state/
  ├── orchestration.json  # Shared across all projects!
  ├── agents.json
  └── events.jsonl
```

### After (Project-Specific - Good)
```
/project-a/.claude/state/
  ├── orchestration.json  # Project A only
  ├── agents.json
  └── events.jsonl

/project-b/.claude/state/
  ├── orchestration.json  # Project B only
  ├── agents.json
  └── events.jsonl
```

No migration needed - each project automatically gets its own state on first run.

## Summary

- ✅ State is **always project-specific** via `${CLAUDE_PROJECT_DIR}/.claude/state/`
- ✅ Multiple projects can run orchestration simultaneously
- ✅ State persists across sessions for the same project
- ✅ Clean isolation prevents conflicts
- ✅ Easy to manage and clean up per-project

This ensures a clean, isolated experience when working with multiple projects!
