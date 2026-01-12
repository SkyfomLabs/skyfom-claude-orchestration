# User Guide

Complete guide to using Skyfom Orchestration Plugin.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Usage](#basic-usage)
3. [Advanced Features](#advanced-features)
4. [Configuration](#configuration)
5. [Monitoring](#monitoring)
6. [Best Practices](#best-practices)

## Getting Started

### Prerequisites Setup

1. **Beads Epic**: Create an epic in Beads
   ```bash
   bd create "Epic: User Authentication System" -t epic --json
   # Note the epic ID (e.g., bd-epic-123)
   ```

2. **Project Structure**: Ensure your project has:
   - Git repository initialized
   - GitHub remote configured
   - Beads configuration

### Your First Orchestration

```bash
# Start Claude Code
claude

# Run orchestration (with approval prompts)
/skyfom-orchestrate bd-epic-123

# PM will:
# 1. Analyze epic requirements
# 2. Break down into tasks
# 3. Create Beads tickets
# 4. Request your approval
# 5. Spawn specialized agents
```

## Basic Usage

### Starting Orchestration

**With Human Approval** (Recommended for first use):
```bash
/skyfom-orchestrate bd-epic-123
```
- PM requests approval before spawning agents
- You can review tasks before execution
- Safer for learning the system

**Autonomous Mode**:
```bash
/skyfom-orchestrate bd-epic-123 --no-human-verify
```
- Fully autonomous operation
- No approval prompts
- Use when you trust the system

### Stopping Orchestration

```bash
/skyfom-stop-orchestrate
```
- Gracefully stops all agents
- Preserves work in progress
- Creates stop report

### Checking Status

```bash
# View orchestration state
cat .claude/state/orchestration.json

# Watch events in real-time
tail -f .claude/state/events.jsonl

# Check active agents
cat .claude/state/agents.json | jq '.'
```

## Advanced Features

### Multi-Agent Workflow

The system automatically:

1. **Analyzes Epic**: PM + CTO estimate complexity
2. **Breaks Down Tasks**: Creates tasks <100k tokens each
3. **Spawns Agents**: Up to 7 in parallel
4. **Code Review**: Loops until code is clean (max 50)
5. **CI/CD**: Waits for GitHub Actions
6. **QA Testing**: Validates implementation
7. **Merges**: PM merges when all done

### Token Management

The system tracks token usage:

- **100k tokens**: Ideal target per agent
- **160k tokens**: Warning (creates summary file)
- **200k tokens**: Hard limit (spawns new agent)

```bash
# Monitor token usage
watch -n 5 'jq ".metrics.totalTokensUsed" .claude/state/orchestration.json'
```

### Agent Specialization

Each agent has specific expertise:

```bash
# Frontend tasks → skyfom-frontend-developer
# Backend APIs → skyfom-backend-developer
# Mobile screens → skyfom-mobile-developer
# Infrastructure → skyfom-devops
# Testing → skyfom-qa
# Design specs → skyfom-designer
```

## Configuration

### Global Settings

Edit `.claude/state/orchestration.json`:

```json
{
  "config": {
    "maxParallelAgents": 7,
    "maxCodeReviewLoops": 50,
    "maxTokensPerAgent": 200000,
    "tokenWarningThreshold": 160000,
    "idealTokensPerAgent": 100000,
    "autoRestart": false,
    "humanApprovalRequired": true
  }
}
```

### Per-Project Customization

For smaller projects:
```json
{
  "maxParallelAgents": 3,
  "maxTokensPerAgent": 100000
}
```

For large epics:
```json
{
  "maxParallelAgents": 7,
  "autoRestart": true
}
```

## Monitoring

### Real-Time Monitoring

```bash
# Terminal 1: Watch state
watch -n 2 'cat .claude/state/orchestration.json | jq ".status, .metrics"'

# Terminal 2: Watch events
tail -f .claude/state/events.jsonl | jq '.'

# Terminal 3: Watch agents
watch -n 5 'cat .claude/state/agents.json | jq ".[] | {id, skill, status}"'
```

### Understanding Events

Events are logged in JSONL format:

```json
{"timestamp":"2026-01-12T10:00:00Z","type":"agent_spawned","agentId":"agent-123","skill":"frontend"}
{"timestamp":"2026-01-12T10:05:00Z","type":"agent_completed","agentId":"agent-123","tokensUsed":85000}
```

## Best Practices

### Epic Preparation

1. **Clear Requirements**: Write detailed epic descriptions
2. **Break Down Logically**: Group related features
3. **Set Priorities**: Mark critical vs optional features
4. **Define Acceptance Criteria**: Clear success metrics

### During Orchestration

1. **Monitor Progress**: Watch agent status regularly
2. **Review PRs Promptly**: Don't block agents waiting for reviews
3. **Check Token Usage**: Ensure agents stay under limits
4. **Respond to Blockers**: Address issues quickly

### After Completion

1. **Review Code Quality**: Check all merged PRs
2. **Run Tests**: Verify all tests pass
3. **Deploy**: Follow your deployment process
4. **Document**: Update documentation as needed

## Examples

### Example 1: Simple Feature

```bash
# Epic: Add user profile page
/skyfom-orchestrate bd-epic-profile

# Agents spawned:
# - Frontend: Profile UI component
# - Backend: Profile API endpoint
# - QA: E2E tests
```

### Example 2: Full Stack

```bash
# Epic: Shopping cart system
/skyfom-orchestrate bd-epic-cart

# Agents spawned:
# - Frontend: Cart UI
# - Backend: Cart API + database
# - Mobile: Cart screens
# - DevOps: Cache setup
# - Designer: UI specs
# - QA: E2E tests
```

### Example 3: Infrastructure

```bash
# Epic: Kubernetes migration
/skyfom-orchestrate bd-epic-k8s --no-human-verify

# Agents spawned:
# - DevOps: K8s manifests + Terraform
# - Backend: Health checks
# - QA: Load testing
```

## Troubleshooting

See [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues.

Quick fixes:

**Orchestration stuck?**
```bash
/skyfom-stop-orchestrate
# Wait 30 seconds
/skyfom-orchestrate bd-epic-123
```

**Agent exceeded tokens?**
```bash
# Check summary file
cat .claude/state/agent-*-summary.md
# New agent spawned automatically
```

**Review loop not finishing?**
```bash
# Check review comments
cat .claude/state/review-comments.json
# Fix issues manually if needed
```

## Getting Help

- **Documentation**: Check other docs in `/docs`
- **Issues**: https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/issues
- **Discussions**: https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/discussions

---

**Next Steps**: Try orchestrating a small epic to get familiar with the system!
