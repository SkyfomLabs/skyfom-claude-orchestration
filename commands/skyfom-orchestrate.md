---
description: Orchestrate multi-agent parallel development with automatic task management
allowed-tools: Task(*), Bash(bd:*), Bash(git:*), Bash(gh:*), Read, Write
argument-hint: [epic-id] [--no-human-verify]
model: claude-sonnet-4-5-20250929
---

# Skyfom Orchestration

Multi-agent orchestration system for parallel task execution with code review loops and CI/CD integration.

## Arguments
- **$1**: Epic/Phase ID (e.g., "bd-epic-auth", "phase-2")
- **--no-human-verify**: Run fully autonomous without human approval between phases

## Pre-Orchestration Context

**Epic**: !`bd show $1 --json 2>/dev/null || echo "{}"`

**Ready Tasks**: !`bd ready --json | head -20`

**Active Branches**: !`git branch | head -10`

**State**: !`cat .claude/state/orchestration.json 2>/dev/null | jq -r '.status' || echo "idle"`

## Orchestration Workflow

### Phase 1: Task Planning & Breakdown

1. **Read Epic Requirements**
   - Parse epic from Beads: `bd show $1 --json`
   - Extract acceptance criteria and deliverables
   - Identify technical constraints

2. **Estimate Token Usage**
   - Calculate complexity of each requirement
   - Estimate tokens needed per task
   - Flag tasks >100k tokens for splitting

3. **Break Down into Tasks**
   - Spawn `/skyfom-cto` to create task breakdown
   - Each task must be <100k tokens (split if needed)
   - Create dependencies in Beads
   - Assign skills to each task

4. **Create Beads Tasks**
   ```bash
   bd create "Task title" -t task -p 1 --json
   bd dep add <task-id> <epic-id> --type parent-child
   ```

### Phase 2: Agent Spawning (Fork Workflow)

**Max Parallel Agents**: 7

For each ready task (up to 7 in parallel):

1. **Check Available Slots**
   - Count active agents in `.claude/state/agents.json`
   - Calculate: `available = 7 - active_count`

2. **Claim Task**
   ```bash
   bd update <task-id> --status in_progress --assignee <agent-name>
   ```

3. **Spawn Agent** (using Task tool with fork workflow)
   ```
   Use Task tool to spawn:
   - subagent_type: Determined by task skill requirement
   - description: "Implement <task-title>"
   - prompt: Full task context with requirements
   - model: "haiku" for simple tasks, "sonnet" for complex
   ```

4. **Track Agent**
   - Add to `.claude/state/agents.json`
   - Record: agent_id, task_id, skill, start_time, token_count

### Phase 3: Code Review Loop (Max 50 Iterations)

When developer completes implementation:

1. **Spawn Code Reviewer**
   ```
   Use Task tool to spawn skyfom-code-reviewer:
   - Review PR changes
   - Detect bugs, security issues, performance problems
   - Generate fix suggestions
   ```

2. **Review Result**
   - P0/P1 issues → Developer fixes → Re-review (loop++)
   - P2/P3 only → Proceed to CI/CD
   - Loop count >= 50 → Escalate to human

3. **Auto-Fix** (if reviewer provides fixes)
   - Developer applies suggested fixes
   - Creates new commit
   - Updates PR

### Phase 4: CI/CD Integration

1. **Wait for GitHub Actions**
   - Monitor PR checks: `gh pr checks <pr-number>`
   - Poll every 30 seconds
   - Timeout after 30 minutes

2. **CI Status**
   - **Success** → Proceed to merge
   - **Failure** → Developer fixes → Back to review loop
   - **Timeout** → Escalate to human

3. **Track Status**
   - Update `.claude/state/tasks.json` with CI status
   - Log events to `.claude/state/events.jsonl`

### Phase 5: Task Completion

When CI passes and review clean:

1. **Update Task**
   ```bash
   bd close <task-id> --reason "PR #<number> merged"
   ```

2. **Update Metrics**
   - Increment completed count
   - Record review loops
   - Sum token usage

3. **Next Task Check**
   - Get ready tasks: `bd ready --json`
   - If available → Agent claims next task
   - If none → Agent reports completion, requests more tasks

4. **Request More Tasks** (if no ready tasks)
   - Spawn PM agent to check epic progress
   - PM creates more tasks if epic incomplete
   - If epic complete → Proceed to Phase 6

### Phase 6: PM Review & Phase Completion

PM Agent reviews completed work:

1. **Verify Merges**
   ```bash
   gh pr list --state merged --json number,title,mergedAt
   git log --oneline origin/main --since="<phase_start>"
   ```

2. **Check Epic Progress**
   ```bash
   bd dep tree <epic-id>
   bd list --status closed --parent <epic-id>
   ```

3. **Phase Decision**
   - **All tasks done** → Phase complete
   - **Issues found** → Create fix tasks
   - **Incomplete** → Continue orchestration

4. **Auto-Restart** (if configured)
   - Check: `.claude/state/orchestration.json` → `config.autoRestart`
   - If `true` and `--no-human-verify` → Restart from Phase 1
   - If `false` → Await human approval → Restart

## State Management

All state in `.claude/state/`:

```json
{
  "status": "running",
  "phase": "agent_spawning",
  "epicId": "$1",
  "config": {
    "maxParallelAgents": 7,
    "maxCodeReviewLoops": 50,
    "maxTokensPerAgent": 200000,
    "tokenWarningThreshold": 160000,
    "autoRestart": false,
    "humanApprovalRequired": true
  },
  "agents": [...],
  "tasks": [...],
  "metrics": {...}
}
```

## Token Management

- **Ideal**: 100k tokens per agent
- **Max**: 200k tokens per agent
- **Warning**: 160k tokens → Create summary, spawn new agent
- **Tracking**: Update after each agent completion

## Error Handling

- **Agent stuck** (>2hrs) → Escalate to human
- **Review loop limit** (50) → Escalate to human
- **CI failure** (5x) → Escalate to human
- **Merge conflict** → Developer resolves, PM re-reviews

## Execution

Start orchestration with:
```bash
# With human approval between phases
/skyfom-orchestrate bd-epic-auth

# Fully autonomous
/skyfom-orchestrate bd-epic-auth --no-human-verify
```

Monitor progress:
```bash
cat .claude/state/orchestration.json
cat .claude/state/agents.json
tail -f .claude/state/events.jsonl
```

Stop orchestration:
```bash
/skyfom-stop-orchestrate
```

## Success Criteria

- All tasks completed and merged
- Zero P0/P1 code review issues
- All CI/CD checks passing
- No merge conflicts
- Epic marked as done in Beads
