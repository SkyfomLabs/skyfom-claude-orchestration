# Changelog

All notable changes to Skyfom Orchestration will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/releases/tag/v1.0.0
