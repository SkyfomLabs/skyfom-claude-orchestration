# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Skyfom Orchestration is a multi-agent orchestration plugin for Claude Code that enables parallel development with up to 7 specialized AI agents. The system manages epics through Beads task tracker, implements automatic code review loops (max 50 iterations), and optimizes token usage (100k ideal, 200k max per agent).

### Parallel Execution Framework

The system supports three levels of parallelism:
1. **PM Level**: Project Manager spawning up to 7 developers in parallel (single message, multiple Task calls)
2. **Skill Composition**: Composite skills orchestrating multiple sub-skills with dependency management
3. **Sub-Skill Spawning**: Any skill can spawn specialized sub-agents in parallel for subtasks

See `docs/PARALLEL-EXECUTION.md` for comprehensive guide.

## Architecture

This is a Claude Code plugin repository with the following component structure:

```
.claude-plugin/         # Plugin metadata and configuration
commands/               # User-invocable commands (/skyfom-orchestrate, /skyfom-stop-orchestrate, /skyfom-init)
skills/                 # 12 specialized agent skills (PM, CTO, Frontend, Backend, Mobile, Desktop, DevOps, QA, Code Reviewer, Research, Designer, Token Efficiency)
hooks/                  # Lifecycle hooks (SessionStart, PreToolUse, PostToolUse, SessionEnd)
orchestrator/           # Core orchestration logic (state management, types)
.claude/state/          # Runtime state files (orchestration.json, agents.json, tasks.json, events.jsonl)
docs/                   # User documentation
```

### Core Components

**Commands** (`commands/*.md`): Entry points for users. Each command is a Markdown file with frontmatter defining behavior, allowed tools, and arguments.

**Skills** (`skills/*/SKILL.md`): Specialized agents with specific tech stacks and responsibilities. Each skill is a Markdown file with frontmatter defining name, description, and model. Skills can be:
- **Atomic Skills**: Single-purpose skills (backend, frontend, mobile, etc.)
- **Composite Skills**: Skills composed of multiple sub-skills with parallel execution (fullstack, feature-complete)

**Hooks** (`hooks/hooks.json`): Lifecycle hooks that run shell scripts at specific events to validate operations and track state.

**Orchestrator** (`orchestrator/*.ts`): TypeScript types and utilities for state management, parallel execution, and skill composition. Includes parallel-executor.ts for spawning multiple agents simultaneously.

**State Files** (`.claude/state/*.json`): JSON files tracking active orchestration state, agent status, task progress, and metrics. Events logged to `.jsonl` format.

## Key Technologies

- **Beads CLI** (`bd` command): Task/epic management system. All task operations use JSON output via `bd <cmd> --json`
- **GitHub CLI** (`gh` command): PR management, CI/CD status checking
- **Bun**: JavaScript runtime and package manager (preferred over npm/yarn)
- **TypeScript**: Type definitions for orchestration state

## Tech Stacks by Skill

### Frontend Development
- Runtime: Bun + Vite
- Frameworks: React 18+, Svelte 5+
- UI: Shadcn/ui, Radix UI, Tailwind CSS
- State: Zustand
- Data: TanStack Query, GraphQL (urql), Zod validation
- Testing: Vitest, Playwright
- Architecture: Feature-Sliced Design (FSD)

### Backend Development
- MVP: Bun + Hono + Drizzle + Zod (TypeScript monolith)
- Scale: Rust + Actix Web + Diesel (microservices)
- Database: PostgreSQL (optimized for cost/memory)
- APIs: REST, GraphQL, gRPC (tonic)
- Messaging: RabbitMQ, Kafka

### Mobile Development
- Framework: React Native + Expo
- Styling: NativeWind (Tailwind for React Native)
- Guidelines: Material Design 3 (Android), Human Interface Guidelines (iOS)
- Native: Swift (iOS), Kotlin (Android) for performance-critical modules
- Testing: Maestro (E2E)

### Desktop Development
- Primary: Tauri 2.0 (Rust + TypeScript)
- Fallback: Electron (when needed)
- Platforms: Linux, Windows, macOS

### DevOps
- Containers: Docker, Docker Compose
- Orchestration: Kubernetes, Nginx
- IaC: Terraform
- CI/CD: GitHub Actions
- Cloud: AWS (production), Cloudflare (no proxy)

## Development Commands

### Plugin Development
```bash
# Make hooks executable
chmod +x hooks/scripts/*.sh

# Test locally in another project
cp -r . /path/to/test-project/.claude
cd /path/to/test-project
claude

# View plugin info
cat .claude-plugin/plugin.json
```

### State Management
```bash
# View orchestration state
cat .claude/state/orchestration.json

# View active agents
cat .claude/state/agents.json

# View task progress
cat .claude/state/tasks.json

# Monitor events in real-time
tail -f .claude/state/events.jsonl

# Check token usage per agent
cat .claude/state/agents.json | jq '.[] | {id, tokenUsage}'
```

### Beads Integration
```bash
# Find ready tasks
bd ready --json

# Show epic/task details
bd show <id> --json

# Create task with parent dependency
bd create "Task title" -t task -p 1 --json
bd dep add <task-id> <epic-id> --type parent-child

# Update task status
bd update <task-id> --status in_progress

# Close task
bd close <task-id> --reason "PR #123 merged"

# View dependency tree
bd dep tree <epic-id>
```

### GitHub Integration
```bash
# View PR
gh pr view <number>

# Check CI status
gh pr checks <number>

# Approve PR
gh pr review <number> --approve

# Merge PR
gh pr merge <number> --squash
```

## Orchestration Workflow

The system follows a 6-phase workflow:

1. **Task Planning**: PM + CTO break down epic into tasks <100k tokens each
2. **Agent Spawning**: PM spawns up to 7 specialized agents in parallel using **single message with multiple Task calls** (critical for true parallelism)
3. **Code Review Loop**: Developer ↔ Code Reviewer (max 50 iterations) until clean
4. **CI/CD Integration**: Wait for GitHub Actions, handle failures
5. **Task Completion**: Close tasks, agents claim next available tasks
6. **PM Review**: Verify all merged, auto-restart if configured

### Parallel Execution

**CRITICAL**: To spawn agents in parallel, use a SINGLE message with MULTIPLE Task tool calls.
- ❌ Wrong: Separate messages for each agent (sequential execution)
- ✅ Correct: One message with 7 Task calls (parallel execution)

See `skills/skyfom-pm-agent-orchestrator/workflows/parallel-spawning-guide.md` for detailed instructions.

### Configuration

Edit `.claude/state/orchestration.json` to adjust:
- `maxParallelAgents`: 7 (default)
- `maxCodeReviewLoops`: 50 (default)
- `maxTokensPerAgent`: 200000 (100k ideal, 160k warning, 200k max)
- `autoRestart`: false (auto-restart on phase completion)
- `humanApprovalRequired`: true (require approval between phases)

## Important Patterns

### Task Token Management
- Estimate tokens before task creation
- Split tasks if >100k tokens
- Track usage in `.claude/state/agents.json`
- Warning at 160k → create summary, spawn new agent
- Hard limit at 200k per agent

### Code Review Loop
- Developer implements → PR created
- Code Reviewer spawned via Task tool
- P0/P1 issues → Developer fixes → Re-review (loop++)
- P2/P3 only → Proceed to CI/CD
- Loop >= 50 → Escalate to human

### Agent Communication
Agents communicate via JSON state files in `.claude/state/`:
- Agents track status in `agents.json`
- Tasks tracked in `tasks.json`
- Events logged to `events.jsonl` (newline-delimited JSON)
- Main orchestration state in `orchestration.json`

### Hook System
Hooks run at lifecycle events:
- `SessionStart`: Initialize environment, load state
- `PreToolUse[Task]`: Validate task spawn parameters, check agent slots
- `PreToolUse[Bash]`: Validate bash commands for security
- `PostToolUse[Task]`: Track agent completion, update metrics
- `SessionEnd`: Save state, generate session report

## Skill Development

When creating or modifying skills:

1. Each skill is in `skills/<skill-name>/SKILL.md`
2. Frontmatter defines: name, description, model
3. Include role, tech stack, workflow, commands, success metrics
4. Reference `workflows/main-workflow.md` if shared workflow exists
5. Define Beads commands, GitHub commands, testing approach
6. Specify integration points with other skills

### Skill Structure Template
```markdown
---
name: skill-name
description: Short description for skill selector
model: claude-sonnet-4-5-20250929
---

# Skill Title

Brief role description.

## Role
- Key responsibility 1
- Key responsibility 2

## Tech Stack
| Category | Technology |
|----------|------------|
| ... | ... |

## Workflow
1. Step 1
2. Step 2

## Beads Commands
```bash
bd command examples
```

## Success Metrics
- Metric 1
- Metric 2
```

## File Naming Conventions

- Commands: `commands/<command-name>.md`
- Skills: `skills/<skill-name>/SKILL.md`
- State files: `.claude/state/<name>.json` (or `.jsonl` for logs)
- Hook scripts: `hooks/scripts/<hook-name>.sh` or `.py`
- Types: `orchestrator/*.ts`

## Important Notes

- Always use Beads JSON output: `bd <cmd> --json`
- Track all agents in `.claude/state/agents.json`
- Update metrics after agent completion
- Follow Feature-Sliced Design for frontend code
- Start backend as Bun/Hono monolith, extract Rust microservices post-MVP
- Use Tauri 2.0 for desktop (prefer over Electron)
- All commits should reference task ID: `feat(scope): description (bd-task-id)`
- PRs must pass code review loops before CI/CD
- Token warning at 160k, hard limit at 200k per agent
- Max 7 parallel agents, max 50 code review loops
- Escalate to human if agent stuck >2hrs or loops hit limit

## Dependencies

Required:
- Claude Code CLI v2.0.12+
- Beads CLI (`bd` command)
- GitHub CLI (`gh` command)
- Git

Optional (based on tech stack):
- Bun (JavaScript/TypeScript runtime)
- Docker (containerization)
- Maestro (mobile E2E testing)
- Playwright (web E2E testing)
