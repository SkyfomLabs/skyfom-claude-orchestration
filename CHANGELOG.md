# Changelog

All notable changes to Skyfom Orchestration will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/skyfom/skyfom-claude-orchestration/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/skyfom/skyfom-claude-orchestration/releases/tag/v1.0.0
