# Skyfom Orchestrator

Multi-agent orchestration system for autonomous development with Claude Code.

## Overview

The Skyfom Orchestrator coordinates multiple specialized agents working in parallel on tasks managed in Beads, with automatic code review loops, CI/CD integration, and phase-based workflow automation.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                 Skyfom Orchestrator                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Commands:                                               │
│  - /skyfom-orchestrate [--no-human-verify]              │
│  - /skyfom-stop-orchestrate                              │
│                                                           │
│  Workflows:                                              │
│  1. PM/CTO → Break down Epic into Tasks                 │
│  2. PM → Spawn Developer Agents (fork, max 7 parallel)   │
│  3. Developer → Implement → Code Review Loop (max 50)    │
│  4. Developer → Wait for CI/CD (GitHub webhooks)         │
│  5. Developer → Mark Done, take next task                │
│  6. PM → Review completed tasks                          │
│  7. PM → Auto-restart if phase complete                  │
│                                                           │
└──────────────────────────────────────────────────────────┘
         │
         ├─── State Management (.claude/state/*.json)
         ├─── Agent Spawner (fork workflow, max 7)
         ├─── Code Review Loop (max 50 iterations)
         ├─── CI/CD Integration (GitHub webhooks)
         ├─── Token Tracker (100k ideal, 200k max)
         └─── Beads Integration (task management)
```

## Commands

### Start Orchestration

```bash
/skyfom-orchestrate                  # With human approval between phases
/skyfom-orchestrate --no-human-verify # Fully autonomous
```

### Stop Orchestration

```bash
/skyfom-stop-orchestrate
```

## State Management

All state stored in `.claude/state/`:

- `orchestration.json` - Main orchestration state
- `agents.json` - Active agent states
- `tasks.json` - Task tracking
- `events.jsonl` - Event log (JSONL format)
- `phase-<id>.md` - Phase progress reports

## Workflow Phases

### Phase 1: Task Planning

PM/CTO agents:
1. Read epic from Beads
2. Estimate token requirements
3. Break into tasks <100k tokens each
4. Create task dependencies
5. Assign skills to tasks

### Phase 2: Parallel Development

PM spawns developer agents (max 7 parallel):
1. Each agent claims a ready task
2. Implements feature on branch
3. Creates PR
4. Enters code review loop

### Phase 3: Code Review Loop

Developer ↔ Code Reviewer (max 50 iterations):
1. Developer implements/fixes
2. Code Reviewer analyzes
3. If issues found → Developer fixes → repeat
4. If clean → proceed to CI/CD

### Phase 4: CI/CD Integration

1. Wait for GitHub Actions (claude-code-review)
2. Monitor via webhooks
3. If fails → Developer fixes → back to review
4. If passes → mark task done

### Phase 5: Task Completion

Developer:
1. Update Beads task status
2. Check for more ready tasks
3. If available → claim next task
4. If none → request PM to create more

### Phase 6: PM Review & Restart

PM:
1. Review all completed tasks
2. Verify merged to main
3. Check phase progress
4. If phase complete → auto-restart from Phase 1

## Configuration

Edit `.claude/state/orchestration.json`:

```json
{
  "config": {
    "maxParallelAgents": 7,
    "maxCodeReviewLoops": 50,
    "maxTokensPerAgent": 200000,
    "tokenWarningThreshold": 160000,
    "autoRestart": false,
    "humanApprovalRequired": true
  }
}
```

## Agent Communication

Agents communicate via JSON files in `.claude/state/`:

```typescript
// Agent reports completion
{
  "type": "task_completed",
  "agentId": "agent-abc123",
  "taskId": "bd-xyz789",
  "prNumber": 42,
  "reviewLoops": 3,
  "tokenUsage": 85000
}
```

## Token Management

- **Per Agent**: 100k ideal, 200k max
- **Warning at**: 160k tokens
- **Action**: Create summary file, spawn new agent

## Error Handling

- **Agent stuck**: Timeout after 2 hours, escalate to human
- **Review loop limit**: After 50 loops, escalate to human
- **CI/CD fails repeatedly**: After 5 failures, escalate to human
- **Merge conflicts**: Developer resolves, PM re-reviews

## Integration Points

### Beads CLI

```bash
bd ready --json              # Get ready tasks
bd show <id> --json          # Task details
bd update <id> --status X    # Update task
bd close <id> --reason "X"   # Complete task
```

### GitHub CLI

```bash
gh pr create                 # Create PR
gh pr view <number>          # View PR
gh pr checks <number>        # Check CI status
gh pr merge <number>         # Merge PR
```

### Claude Code Agent API

```typescript
// Spawn agent with fork workflow
await spawnAgent({
  type: 'fork',
  skill: 'skyfom-frontend-developer',
  task: taskData,
  maxTokens: 100000
});
```

## Monitoring

View orchestration status:

```bash
# State files
cat .claude/state/orchestration.json
cat .claude/state/agents.json
cat .claude/state/tasks.json

# Event log
tail -f .claude/state/events.jsonl
```

## Directory Structure

```
.claude/
├── orchestrator/
│   ├── README.md                 # This file
│   ├── types.ts                  # TypeScript types
│   ├── state-manager.ts          # State management
│   ├── orchestrator.ts           # Main orchestrator
│   ├── agent-spawner.ts          # Agent spawning logic
│   ├── review-loop.ts            # Code review loop
│   ├── ci-integration.ts         # CI/CD webhooks
│   └── token-tracker.ts          # Token management
├── state/
│   ├── orchestration.json        # Main state
│   ├── agents.json               # Agent states
│   ├── tasks.json                # Task states
│   ├── events.jsonl              # Event log
│   └── phase-*.md                # Phase reports
├── hooks/
│   ├── pre-task.sh               # Before task start
│   ├── on-task-complete.sh       # After task done
│   ├── on-pr-created.sh          # After PR created
│   └── on-ci-complete.sh         # After CI finishes
└── skills/
    ├── skyfom-pm-agent-orchestrator/
    ├── skyfom-cto/
    ├── skyfom-frontend-developer/
    ├── skyfom-backend-developer/
    ├── skyfom-mobile-developer/
    ├── skyfom-devops/
    ├── skyfom-code-reviewer/
    ├── skyfom-qa/
    └── skyfom-tokens-efficiency/
```

## Lessons from Senior-Vibe-Coder

Successful patterns replicated:
1. ✅ Beads CLI integration with JSON output
2. ✅ Signal-based process control (SIGINT, SIGTSTP, SIGCONT)
3. ✅ Session handoff documentation
4. ✅ Task ID in commits and branches
5. ✅ Multi-stream output (stdout/stderr)
6. ✅ PM as decision maker

Issues fixed:
1. ✅ Unified on one package manager (bun)
2. ✅ Mandatory git push before session end
3. ✅ Proper test mocking vs E2E separation
4. ✅ Token tracking and limits
5. ✅ Auto-restart on phase complete
6. ✅ Human escalation for stuck agents

## Usage Example

```bash
# Start orchestration
/skyfom-orchestrate

# System will:
# 1. PM reads epics from Beads
# 2. PM breaks down into tasks
# 3. PM spawns 7 developer agents
# 4. Each developer implements task
# 5. Code reviewer loops until clean
# 6. CI/CD runs and verifies
# 7. Tasks marked done
# 8. PM reviews and restarts

# Stop at any time
/skyfom-stop-orchestrate
```

## Troubleshooting

### Orchestrator won't start
- Check `.claude/state/orchestration.json` for errors
- Run `rm -rf .claude/state && /skyfom-orchestrate` to reset

### Agents stuck
- Check `.claude/state/agents.json` for status
- View logs in agent output files
- Stop and restart: `/skyfom-stop-orchestrate && /skyfom-orchestrate`

### Token limit exceeded
- Reduce `maxTokensPerAgent` in config
- System should auto-split at 160k warning

### CI/CD not triggering
- Check GitHub webhooks configured
- Verify `.github/workflows/` has claude-code-review.yml
- Check GitHub Actions permissions

## Development

To modify orchestrator behavior:

1. Edit `orchestrator.ts` for main logic
2. Edit `agent-spawner.ts` for agent spawning
3. Edit `review-loop.ts` for review logic
4. Edit `ci-integration.ts` for CI/CD
5. Edit skill `SKILL.md` files for agent behavior

Test changes:
```bash
bun test orchestrator/*.test.ts
```

## License

Part of Skyfom development system.
