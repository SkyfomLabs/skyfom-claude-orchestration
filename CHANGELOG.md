# Changelog

All notable changes to Skyfom Orchestration will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-01-13

### Added
- **Autonomous Loop Control** - Inspired by Ralph for Claude Code
  - Agents loop automatically until task completion without manual intervention
  - PM orchestrator loops continuously until epic complete
  - Dual-condition exit gate: EXIT_SIGNAL + >= 2 completion indicators
  - Progress tracking via output hashing
  - Semantic completion pattern detection (10 patterns)
- **Circuit Breaker Protection** - Prevents infinite loops and API exhaustion
  - No Progress Breaker: Opens after 5 consecutive loops with no progress
  - Repeated Error Breaker: Opens after 10 consecutive loops with same error
  - Circuit states: closed, half_open, open
  - Automatic escalation to human on circuit open
- **Rate Limit Resilience** - Automatic retry with countdown
  - Auto-retry every 60 seconds when rate limit hit
  - Infinite retries until API access restored
  - User-friendly countdown display: "⏳ Rate limited. Retrying in 45s (45s)"
  - Global rate limiter shared across all agents
- **Loop State Tracking** - Comprehensive loop metrics
  - Per-agent loop state in `.claude/state/agents.json`
  - Loop metrics: totalLoops, circuitBreakerTrips, rateLimitHits, averageLoopsPerTask
  - Loop events logged to `.claude/state/events.jsonl`
  - New event types: loop_iteration, circuit_breaker_open, rate_limit_hit, exit_signal_detected
- **Loop Manager** (`orchestrator/loop-manager.ts`)
  - `analyzeExitCondition()` - Dual-condition gate validation
  - `detectProgress()` - Hash-based progress detection
  - `detectRepeatedError()` - Error pattern tracking
  - `updateLoopState()` - Circuit breaker logic
- **Rate Limiter** (`orchestrator/rate-limiter.ts`)
  - `checkRateLimit()` - Rate limit status check
  - `triggerRateLimit()` - Trigger retry countdown
  - `waitForRateLimit()` - Auto-retry with sleep
  - `isRateLimitError()` - Detect rate limit errors
- **Loop Monitoring Hooks**
  - `track-loop-iteration.py` - PostToolUse hook for loop tracking
  - Detects EXIT_SIGNAL and completion indicators
  - Logs circuit breaker and rate limit events
  - Updates loop metrics in real-time
- **Epic Discovery Workflow** - Smart epic selection
  - PM checks for ready epics via `bd list --type epic --status ready`
  - Selects highest priority epic automatically
  - If no ready epics, spawns CTO to create one
  - CTO analyzes project needs and creates epic with breakdown
  - Epic ID auto-saved to orchestration state
- **Documentation**
  - `skills/workflows/autonomous-loop-workflow.md` - Complete loop execution guide
  - Updated PM orchestrator with Phase 0: Epic Discovery
  - Updated command documentation with epicless mode examples
  - Added examples: `/skyfom-orchestrate` without arguments

### Changed
- **Default Mode**: Autonomous by default (was manual approval between phases)
  - Old: `--no-human-verify` flag for autonomous mode
  - New: `--manual` flag for manual mode (default: autonomous)
- **Epic ID**: Now optional in `/skyfom-orchestrate` command
  - When omitted: PM discovers ready epic or creates one with CTO
  - Added Phase 0: Epic Discovery workflow
  - Auto-saves discovered/created epic ID to state
- **State Version**: Bumped to 1.1.0 with new loop fields
  - Added `autonomousMode`, `circuitBreaker`, `rateLimiter` to config
  - Added `loopState` to AgentState
  - Added loop metrics: totalLoops, circuitBreakerTrips, rateLimitHits, averageLoopsPerTask
- **Agent Status**: New `circuit_open` status for agents with open circuit breaker
- **Session Initialization**: Updated hooks to initialize loop config fields

### Configuration
New config options in `.claude/state/orchestration.json`:
```json
{
  "config": {
    "autonomousMode": true,
    "circuitBreaker": {
      "maxNoProgressLoops": 5,
      "maxRepeatedErrorLoops": 10,
      "enabled": true
    },
    "rateLimiter": {
      "enabled": true,
      "retryDelaySeconds": 60,
      "maxRetries": -1
    }
  }
}
```

### Performance
- **Uninterrupted Execution**: Agents work 24/7 without manual approval gates
- **Automatic Recovery**: Rate limit auto-retry eliminates manual intervention
- **Safety Guarantees**: Circuit breaker prevents wasted API tokens on stuck tasks

### Comparison with Ralph for Claude Code
**Adopted from Ralph**:
- Dual-condition exit gate (EXIT_SIGNAL + completion indicators)
- Circuit breaker with no-progress and repeated-error detection
- Rate limit handling with auto-retry
- Progress tracking via hashing
- Semantic pattern matching for completion

**Skyfom Enhancements**:
- Multi-agent parallel execution (7 agents vs Ralph's 1)
- Nested loops (PM level + agent level)
- Task tracker integration (Beads)
- Per-agent circuit breakers
- Global rate limiter across parallel agents
- Loop state persistence in JSON

## [1.1.0] - 2026-01-13

### Added
- **Project-Specific State Management** - Complete documentation and clarification
  - `docs/PROJECT-SPECIFIC-STATE.md` - Comprehensive guide
  - Each project maintains isolated state in `${CLAUDE_PROJECT_DIR}/.claude/state/`
  - Prevents conflicts when working on multiple projects simultaneously
  - State persists across sessions for the same project
- **Clean Git History** - Removed unrelated commits from parallel execution development

### Changed
- Updated version to 1.1.0
- All repository URLs now point to SkyfomLabs organization
- Cleaner commit history focused on orchestration features only

### Fixed
- Repository URLs corrected to `github.com/SkyfomLabs/skyfom-claude-orchestration`
- Removed accidental commits from agent spawning examples

## [1.0.0] - 2026-01-13

### Added
- **Parallel Execution Framework** - Three levels of parallelism for 7x speedup
  - PM Level: Orchestrate up to 7 developers simultaneously
  - Skill Composition: Composite skills with dependency-aware parallel execution
  - Sub-Skill Spawning: Any skill can spawn parallel sub-agents
- **Composite Skills System** - Skills composed of multiple sub-skills
  - Full-Stack Developer: Backend → Frontend + Mobile in parallel
  - Feature-Complete: Development + QA + Review in parallel
- **Core Framework** (`orchestrator/parallel-executor.ts`)
  - `generateParallelSpawnPrompt()` - Instructions for parallel spawning
  - `validateSkillComposition()` - Validates composite skill definitions
  - `planExecutionOrder()` - Automatic dependency resolution
  - `generateParallelTaskSpecs()` - Creates Task specifications
  - `estimateCompositionTokens()` - Token usage estimation
- **Skill Composition Schema** (`orchestrator/skill-composition-schema.json`)
  - JSON Schema for validating compositions
  - Circular dependency detection
  - Execution mode validation (parallel, sequential, hybrid)
- **Comprehensive Documentation**
  - `docs/PARALLEL-EXECUTION.md` - Complete parallel execution guide
  - `skills/skyfom-pm-agent-orchestrator/workflows/parallel-spawning-guide.md` - PM spawning guide
  - `PARALLEL-EXECUTION-IMPLEMENTATION.md` - Implementation summary
  - `orchestrator/README.md` - Framework technical reference
  - Updated `CLAUDE.md` with parallel execution patterns
- **Example Implementations**
  - Full-Stack Developer composite skill
  - Feature-Complete composite skill
- **Repository Setup**
  - Updated all repository links to `skyfom/skyfom-claude-orchestration`
  - Updated plugin metadata with correct URLs

### Changed
- Updated README.md with parallel execution system documentation
- Expanded from 12 to 14 specialized skills (12 atomic + 2 composite)
- Updated plugin.json with new features and composite skills
- Enhanced Key Highlights section with parallel execution capabilities

### Performance
- **7x speedup** for epic completion with 7 parallel agents
- Reduced wall-clock time from 210 minutes to 30 minutes (7 agents × 30min each)

### Planned
- Additional skill templates
- Enhanced token tracking dashboard
- Web UI for orchestration monitoring
- Slack/Discord integration for notifications

## [1.0.0] - 2026-01-12

### Added
- Initial release of Skyfom Orchestration plugin
- Multi-agent orchestration system (up to 7 parallel agents)
- 12 specialized agent skills:
  - skyfom-pm-agent-orchestrator
  - skyfom-cto
  - skyfom-frontend-developer
  - skyfom-backend-developer
  - skyfom-mobile-developer
  - skyfom-desktop-developer
  - skyfom-devops
  - skyfom-qa
  - skyfom-code-reviewer
  - skyfom-research
  - skyfom-designer
  - skyfom-tokens-efficiency
- Two main commands:
  - `/skyfom-orchestrate` - Start orchestration
  - `/skyfom-stop-orchestrate` - Stop orchestration
- Hook system for validation and tracking:
  - SessionStart hook
  - PreToolUse hooks for Task and Bash validation
  - PostToolUse hooks for agent completion tracking
  - SessionEnd hook
- Token optimization system:
  - 100k ideal target per agent
  - 160k warning threshold
  - 200k hard limit
  - Automatic summary file creation
- State management system:
  - orchestration.json for configuration
  - agents.json for agent tracking
  - events.jsonl for event logging
- Comprehensive documentation:
  - README.md with installation and usage
  - ORCHESTRATION_IMPLEMENTATION.md with architecture details
  - REFACTORING_GUIDE.md for skill development
  - Individual skill documentation (<200 lines each)
- Integration with Beads issue tracker
- Integration with GitHub CLI and GitHub Actions
- Code review loop system (max 50 iterations)
- Epic breakdown and task management
- 6-phase orchestration workflow

### Technical Details
- Claude Code minimum version: 2.0.12
- Node.js minimum version: 18.0.0
- All skill files refactored to <200 lines
- Average skill file size: 174 lines (61% reduction)
- Workflow details moved to separate markdown files
- Template files for reusable patterns
- Reference documentation for commands and best practices

### Dependencies
- Beads CLI (bd command) for task management
- GitHub CLI (gh command) for PR operations
- Git for version control
- Bun/Node.js for JavaScript/TypeScript projects (optional)

### Configuration
- maxParallelAgents: 7
- maxCodeReviewLoops: 50
- maxTokensPerAgent: 200000
- tokenWarningThreshold: 160000
- idealTokensPerAgent: 100000

---

## Version History Legend

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements


[Unreleased]: https://github.com/SkyfomLabs/skyfom-claude-orchestration/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/SkyfomLabs/skyfom-claude-orchestration/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/SkyfomLabs/skyfom-claude-orchestration/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/SkyfomLabs/skyfom-claude-orchestration/releases/tag/v1.0.0
