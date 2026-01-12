# PM Agent Orchestrator - Main Workflow

Detailed workflow for orchestrating multi-agent parallel development.

## Prerequisites

- Beads configured and synced
- GitHub CLI authenticated
- All developer skills available
- `.claude/state/orchestration.json` initialized

## Workflow Steps

### 1. Epic Analysis (Research Phase)

**Input**: Epic ID from user or orchestration command

**Steps**:
1. Fetch epic details:
   ```bash
   bd show <epic-id> --json > /tmp/epic.json
   ```

2. Use web search if needed:
   - Research similar implementations
   - Find best practices
   - Identify libraries/frameworks
   - Check competitor solutions

3. Parse requirements:
   - Extract user stories
   - List acceptance criteria
   - Identify technical constraints
   - Note dependencies

4. Complexity estimation:
   - Estimate lines of code
   - Calculate token usage (chars * 0.25)
   - Identify high-complexity areas
   - Flag tasks needing >100k tokens

### 2. Task Breakdown (Planning Phase)

**Input**: Epic requirements

**Steps**:
1. Spawn CTO agent for technical planning:
   ```
   Use Task tool:
   subagent_type: Plan
   description: "Break down epic into technical tasks"
   prompt: [Epic details + requirements]
   ```

2. Review CTO's task breakdown:
   - Verify completeness
   - Check dependencies
   - Validate estimates
   - Adjust priorities

3. Create tasks in Beads:
   ```bash
   for task in tasks:
     bd create "$task_title" \
       -t task \
       -p $priority \
       -d "$description" \
       --json

     # Link to epic
     bd dep add $task_id $epic_id --type parent-child
   ```

4. Set up dependency chain:
   ```bash
   bd dep add $task_b $task_a --type blocks
   ```

### 3. Agent Assignment (Delegation Phase)

**Input**: Ready tasks from Beads

**Steps**:
1. Get ready tasks:
   ```bash
   bd ready --json > /tmp/ready-tasks.json
   ```

2. For each task, determine agent skill:
   - Backend logic → `skyfom-backend-developer`
   - Frontend UI → `skyfom-frontend-developer`
   - Mobile features → `skyfom-mobile-developer`
   - Infrastructure → `skyfom-devops`
   - Architecture → `skyfom-cto`
   - Quality → `skyfom-code-reviewer`

3. Check available agent slots:
   ```bash
   active_count=$(cat .claude/state/agents.json | jq '[.[] | select(.status == "running")] | length')
   available=$((7 - active_count))
   ```

4. Spawn agents (up to 7 parallel):
   ```
   For each task (max 7):
     Use Task tool:
     subagent_type: general-purpose
     description: "Implement <task-title>"
     prompt: """
     You are <skill-name>.

     Task: <task-details>
     Branch: feature/<task-id>-<description>

     Steps:
     1. Create branch
     2. Implement requirements
     3. Add tests
     4. Create PR
     5. Update Beads

     Follow skill guidelines in .claude/skills/<skill-name>/SKILL.md
     """
     run_in_background: true
   ```

5. Track spawned agents:
   - Update `.claude/state/agents.json`
   - Log event to `.claude/state/events.jsonl`
   - Update Beads task status

### 4. Progress Monitoring (Coordination Phase)

**Input**: Active agents

**Steps**:
1. Monitor agent completion:
   - Check `.claude/state/agents.json` for status
   - Review `.claude/state/events.jsonl` for events
   - Track time elapsed per agent

2. Handle agent completion:
   - Read agent output
   - Verify PR created
   - Check task status in Beads
   - Update metrics

3. Handle blockers:
   - Check for dependency issues
   - Resolve merge conflicts
   - Provide additional context
   - Escalate to human if stuck >2hrs

4. Spawn new agents:
   - If slots available and tasks ready
   - Respawn failed agents with context
   - Continue until all tasks assigned

### 5. PR Review (Quality Gate Phase)

**Input**: Created PRs

**Steps**:
1. For each PR:
   ```bash
   gh pr view $pr_number --json files,commits,checks
   ```

2. Trigger code review:
   ```
   Use Task tool:
   subagent_type: general-purpose
   description: "Review PR #$pr_number"
   prompt: """
   You are skyfom-code-reviewer.

   Review PR #$pr_number for:
   - Security vulnerabilities (P0)
   - Logic bugs (P1)
   - Performance issues (P1-P2)
   - Code quality (P2-P3)

   Generate structured review with:
   - Blockers (P0-P1)
   - Improvements (P2-P3)
   - Fix suggestions
   - Learning resources

   If P0-P1 issues: Request changes
   If clean: Approve
   """
   ```

3. Handle review results:
   - **Clean** → Approve PR
   - **Issues** → Request changes, notify developer
   - **Developer fixes** → Re-review (loop, max 50)

4. Approve clean PRs:
   ```bash
   gh pr review $pr_number --approve \
     --body "Code review passed. Ready to merge."
   ```

### 6. CI/CD Coordination (Automation Phase)

**Input**: Approved PRs

**Steps**:
1. Monitor CI/CD:
   ```bash
   gh pr checks $pr_number --watch
   ```

2. Wait for status:
   - Poll every 30 seconds
   - Timeout after 30 minutes
   - Track status in `.claude/state/tasks.json`

3. Handle CI results:
   - **Success** → Proceed to merge
   - **Failure** → Notify developer, request fix
   - **Timeout** → Escalate to human

### 7. Merge Coordination (Integration Phase)

**Input**: CI-passed PRs

**Steps**:
1. Determine merge order:
   - Check dependencies
   - Resolve conflicts first
   - Merge in dependency order

2. Merge PRs:
   ```bash
   gh pr merge $pr_number --squash --delete-branch
   ```

3. Verify merge:
   ```bash
   git pull origin main
   git log --oneline -1
   ```

4. Close tasks:
   ```bash
   bd close $task_id --reason "PR #$pr_number merged"
   ```

5. Update metrics:
   - Increment completed count
   - Record review loops
   - Sum token usage

### 8. Phase Completion (Delivery Phase)

**Input**: All tasks completed

**Steps**:
1. Verify epic completion:
   ```bash
   bd dep tree $epic_id
   bd list --parent $epic_id --status closed
   ```

2. Run integration tests:
   - Full test suite
   - E2E tests
   - Smoke tests in staging

3. Generate completion report:
   - Tasks completed
   - PRs merged
   - Token usage
   - Review loops average
   - Issues found/fixed

4. Update epic status:
   ```bash
   bd close $epic_id --reason "All tasks completed"
   ```

5. Auto-restart decision:
   - Check `.claude/state/orchestration.json` config
   - If `autoRestart: true` and `--no-human-verify` → Restart
   - If `humanApprovalRequired: true` → Await approval
   - Log completion event

## Error Recovery

### Agent Timeout (>2hrs)
1. Check agent output file
2. Determine stuck reason
3. Respawn with additional context
4. If fails again → Escalate to human

### Review Loop Limit (50)
1. Summarize all issues found
2. Create consolidated fix task
3. Assign to senior developer
4. Escalate to human review

### CI Failure (5x)
1. Analyze failure logs
2. Check for environmental issues
3. Create infrastructure fix task
4. Escalate to DevOps/human

### Merge Conflict
1. Notify task owner
2. Provide conflict context
3. Developer resolves locally
4. PM re-reviews after resolution

## State Transitions

```
idle → planning → delegating → executing → reviewing → merging → completed
  ↑                                                                    ↓
  └────────────────────────── (auto-restart) ─────────────────────────┘
```

## Metrics Tracking

Track in `.claude/state/orchestration.json`:
- Total agents spawned
- Total tasks completed
- Total tokens used
- Average review loops
- Phase duration
- Error rate
