---
name: skyfom-tokens-efficiency
description: Token optimization for cost-effective orchestration. Estimates token usage, auto-splits tasks >100k, tracks consumption, creates summary files at 160k warning. Applied to all Skyfom agents for optimized resource usage.
model: claude-sonnet-4-5-20250929
---

# Skyfom Tokens Efficiency

Token optimization and management for multi-agent orchestration.

## Core Principles

1. **Estimate Before Execute** - Calculate token cost before spawning agents
2. **Split Large Tasks** - Auto-split tasks estimated >100k tokens
3. **Track Consumption** - Monitor token usage in real-time
4. **Warn at Threshold** - Alert at 160k tokens, act at 180k
5. **Summarize & Resume** - Create summary, spawn fresh agent

## Token Limits

| Metric | Value | Action |
|--------|-------|--------|
| Ideal per agent | 100,000 | Target for task planning |
| Warning threshold | 160,000 | Create summary file |
| Hard limit | 200,000 | Must spawn new agent |
| Epic maximum | 1,000,000 | Split into multiple phases |

## Token Estimation

See `workflows/estimation.md` for detailed formulas and examples.

### Formula
```
tokens ≈ characters × 0.25
```

### Task Complexity
| Size | Tokens | Examples |
|------|--------|----------|
| Trivial | <5k | Config changes, typos, simple fixes |
| Small | 5k-25k | Single component, basic feature |
| Medium | 25k-75k | Multi-component feature, API endpoint |
| Large | 75k-150k | Complex feature, multiple files |
| Epic | >150k | Requires splitting into subtasks |

## PM/CTO Workflow

See `workflows/task-splitting.md` for detailed process.

### Before Creating Tasks
1. **Analyze Epic** - Calculate estimated tokens from description
2. **Estimate Complexity** - Count requirements × avg tokens per requirement
3. **Auto-Split if >100k** - Break into logical subtasks <100k each
4. **Create Dependencies** - Document task relationships

### Task Template
```bash
bd create "Task: $title" \
  -d "## Requirements\n...\n## Token Estimate\n~$tokens tokens" \
  --json
```

## Agent Token Tracking

See `workflows/monitoring.md` for tracking implementation.

### During Execution
Agents track usage in `.claude/state/agents.json`:
```json
{
  "id": "agent-abc123",
  "tokenUsage": 85000,
  "tokenEstimate": 100000,
  "warnings": []
}
```

### Checkpoints
Monitor at: 50k, 100k, 160k, 180k, 200k tokens

## Warning Response (160k tokens)

See `workflows/summary-creation.md` for complete process and template.

### Actions
1. Create summary file (completed/remaining work, context)
2. Save to `.claude/state/agent-$id-summary.md`
3. Spawn new agent referencing summary with @file
4. Update state (mark old completed, link new)

## Communication Efficiency

See `reference/communication.md` for best practices.

| Format | Use For | Token Savings |
|--------|---------|---------------|
| JSON | Structured data | 60% vs prose |
| Emoji status | Quick updates | 90% vs full sentences |
| Tables | Comparisons | 70% vs paragraphs |
| References | Context | 95% vs repetition |

### Agent-to-PM Status
```
✅ bd-xyz - PR #42 (85k tokens, 3 loops)
🔄 bd-abc - Implementing (45k tokens)
❌ bd-def - Blocked by dependency
```

## Token Budget Management

### Epic-Level Budget
```bash
task_count=$(bd list --parent $epic_id | wc -l)
total_budget=$((task_count * 75000))  # 75k avg per task
consumed=$(jq '.metrics.totalTokensUsed' .claude/state/orchestration.json)
remaining=$((total_budget - consumed))
```

### Phase-Level Limits
- Phase 1 (Planning): ~50k tokens
- Phase 2 (Implementation): ~400k tokens (7 agents × ~60k avg)
- Phase 3 (Review): ~100k tokens
- Phase 4 (CI/CD): ~20k tokens
- Phase 5 (Integration): ~30k tokens

**Total Phase Budget**: ~600k tokens

## Cost Optimization

### Model Selection
| Model | Use For | Cost |
|-------|---------|------|
| Haiku | Routine ops, status checks, simple fixes | ~1/20th Sonnet |
| Sonnet | Architecture, complex implementation, code review | Standard |

### Best Practices
1. **Avoid Repeated Context** - Use @file references and summary files
2. **Batch Operations** - Review multiple files in one session
3. **Link to Beads** - Reference task IDs instead of repeating details
4. **Concise Updates** - Use emoji status, not full sentences

## Integration with Orchestration

### Hooks
Token tracking via PostToolUse hook:
```bash
# Update .claude/state/agents.json with token usage
```

### State Management
Track in `orchestration.json`:
```json
{
  "metrics": {
    "totalTokensUsed": 338000,
    "averageTokensPerTask": 67600,
    "tokensPerAgent": {...}
  }
}
```

## Monitoring

See `workflows/monitoring.md` for setup.

```bash
# Watch total usage
watch -n 5 'jq ".metrics.totalTokensUsed" .claude/state/orchestration.json'

# Check per-agent
jq '.[] | {id, tokenUsage}' .claude/state/agents.json
```

### Alerts
- Individual agent >160k tokens → Create summary
- Total phase >600k tokens → Review task breakdown
- Epic >1M tokens → Split into multiple epics
- Unusual spikes → Investigate inefficiency

## Token Savings Example

See `reference/communication.md` for more examples.

| Style | Tokens | Example |
|-------|--------|---------|
| Verbose | 500 | "I have analyzed the requirements..." |
| Concise | 50 | "Epic: Backend ~85k, Frontend ~75k, Mobile ~65k, DevOps ~45k. Total ~270k (4 tasks)" |

**Savings**: 90% reduction

## Success Metrics

- Average tokens per task <100k
- Zero agents exceeding 200k
- <10% of tasks require splitting
- Summary files used for context preservation
- Cost per epic <$10 (based on token pricing)
