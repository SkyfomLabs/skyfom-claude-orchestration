# Skyfom Orchestration Plugin for Claude Code

> 🤖 Multi-agent orchestration system for parallel development with automatic task management, code review loops, and token optimization.

[![Claude Code](https://img.shields.io/badge/Claude_Code-v2.0.12+-blue)](https://claude.ai/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/releases)

## 🌟 Overview

Skyfom Orchestration transforms Claude Code into a powerful multi-agent development system. It orchestrates up to **7 parallel AI agents**, each specialized in different domains (frontend, backend, mobile, DevOps, etc.), working together to complete epics efficiently.

### Key Highlights

- 🤖 **12 Specialized Agent Skills** - PM, CTO, Frontend, Backend, Mobile, Desktop, DevOps, QA, Code Reviewer, Research, Designer, Token Efficiency
- 🔄 **Automatic Code Review** - Up to 50 review loops until code meets quality standards
- 📊 **Token Optimization** - Smart tracking and management (100k ideal, 200k max per agent)
- 🎯 **Epic Breakdown** - Automatic task splitting via Beads issue tracker
- ✅ **CI/CD Integration** - GitHub Actions workflow integration
- 🔧 **Hook System** - Validation and tracking at every step

## 📦 Installation

### Option 1: Via NPM (Recommended)

```bash
npx claude-plugins install @YOUR_USERNAME/skyfom-claude-orchestration
```

### Option 2: Via Claude Code Plugin Command

```bash
# Add marketplace
/plugin marketplace add YOUR_USERNAME/skyfom-claude-orchestration

# Install plugin
/plugin install skyfom-orchestration
```

### Option 3: Manual Installation

```bash
# Clone into your project's .claude directory
git clone https://github.com/YOUR_USERNAME/skyfom-claude-orchestration.git .claude

# Make scripts executable
chmod +x .claude/hooks/scripts/*.sh

# Create state directory
mkdir -p .claude/state
```

## 🚀 Quick Start

### Basic Usage

```bash
# Start orchestration for an epic (with human approval)
/skyfom-orchestrate bd-epic-123

# Fully autonomous mode (no approval prompts)
/skyfom-orchestrate bd-epic-123 --no-human-verify

# Stop running orchestration
/skyfom-stop-orchestrate
```

### Example Workflow

1. **PM breaks down epic** into tasks <100k tokens each
2. **PM spawns developer agents** (up to 7 in parallel)
3. **Developers implement features** following FSD architecture
4. **Code reviewer validates** (loops up to 50 times until clean)
5. **CI/CD runs tests** via GitHub Actions
6. **QA validates** with automated tests
7. **PM reviews and merges** completed work

## 🎯 Features

### 6-Phase Orchestration Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Epic Breakdown (PM + CTO)                          │
│  ├─ Analyze requirements                                     │
│  ├─ Estimate tokens                                          │
│  ├─ Split into tasks <100k tokens                           │
│  └─ Create Beads tickets                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Parallel Development (7 agents max)                │
│  ├─ Frontend Developer (React/Svelte)                       │
│  ├─ Backend Developer (Bun/Hono/Rust)                       │
│  ├─ Mobile Developer (React Native)                         │
│  ├─ Desktop Developer (Tauri)                               │
│  ├─ DevOps Engineer (Docker/K8s)                            │
│  ├─ Designer (UI/UX specs)                                  │
│  └─ Research Engineer (Competitor analysis)                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Code Review Loop (max 50 iterations)               │
│  ├─ Security scan (OWASP Top 10)                            │
│  ├─ Performance check (N+1 queries, indexing)               │
│  ├─ Quality analysis (complexity, readability)              │
│  └─ Auto-fix suggestions with learning resources            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: CI/CD Validation                                    │
│  ├─ GitHub Actions trigger                                   │
│  ├─ Unit tests                                               │
│  ├─ E2E tests (Playwright/Maestro)                          │
│  └─ Build verification                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: QA Testing                                          │
│  ├─ API testing (curl)                                       │
│  ├─ Web E2E (Playwright)                                     │
│  ├─ Mobile E2E (Maestro)                                     │
│  └─ Sentry error analysis                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 6: PM Review & Merge                                   │
│  ├─ Review all completed tasks                               │
│  ├─ Merge PRs                                                │
│  ├─ Update documentation                                     │
│  └─ Auto-restart (if configured)                             │
└─────────────────────────────────────────────────────────────┘
```

### Token Optimization

The system intelligently manages token usage:

- **100k tokens** - Ideal target per agent
- **160k tokens** - Warning threshold (creates summary file)
- **200k tokens** - Hard limit (spawns new agent)
- **Auto-splitting** - Tasks >100k automatically split

### 12 Specialized Skills

| Skill | Role | Tech Stack |
|-------|------|------------|
| **PM Orchestrator** | Coordinates multi-agent workflow | Beads, GitHub CLI |
| **CTO** | Epic breakdown, ADR creation | Architecture patterns |
| **Frontend Dev** | React/Svelte applications | Bun, Vite, Shadcn/Radix, Tailwind |
| **Backend Dev** | API development | Bun/Hono/Drizzle, Rust/Actix |
| **Mobile Dev** | React Native apps | Expo, NativeWind, Material Design 3/HIG |
| **Desktop Dev** | Cross-platform desktop | Tauri 2.0, Rust, TypeScript |
| **DevOps** | Infrastructure & CI/CD | Docker, K8s, Terraform, GitHub Actions |
| **QA** | Testing & validation | Playwright, Maestro, curl, Sentry |
| **Code Reviewer** | Multi-language review | Security, performance, quality analysis |
| **Research** | Competitor analysis | Web search, market research |
| **Designer** | UI/UX specifications | Tailwind tokens, component specs |
| **Token Efficiency** | Cost optimization | Token tracking, auto-splitting |

## 📋 Requirements

### Essential

- **Claude Code CLI** v2.0.12 or higher
- **Beads Issue Tracker** - Install via `npm install -g beads-cli` (or your Beads setup)
- **Git** - For version control
- **GitHub CLI (gh)** - For PR management

### Optional (based on your stack)

- **Bun/Node.js** - For JavaScript/TypeScript projects
- **Docker** - For containerized development
- **Maestro** - For mobile E2E testing
- **Playwright** - For web E2E testing

## 🔧 Configuration

### Default Configuration

The system comes with sensible defaults in `.claude/state/orchestration.json`:

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

### Customization

Edit `.claude/state/orchestration.json` to adjust:

- Agent limits
- Token thresholds
- Review loop limits
- Auto-restart behavior

## 📊 Monitoring

### View Orchestration State

```bash
# Check current state
cat .claude/state/orchestration.json

# Watch events in real-time
tail -f .claude/state/events.jsonl

# View active agents
cat .claude/state/agents.json | jq '.[] | {id, skill, status, tokenUsage}'
```

### Monitor Token Usage

```bash
# Total token usage
jq '.metrics.totalTokensUsed' .claude/state/orchestration.json

# Per-agent usage
jq '.[] | {id, tokenUsage}' .claude/state/agents.json
```

## 📚 Documentation

- [**Installation Guide**](docs/INSTALLATION.md) - Detailed setup instructions
- [**User Guide**](docs/USER_GUIDE.md) - Complete usage documentation
- [**Architecture**](ORCHESTRATION_IMPLEMENTATION.md) - System design and implementation
- [**Skill Reference**](docs/SKILLS.md) - All 12 agent skills explained
- [**API Reference**](docs/API.md) - Hook system and state management
- [**Troubleshooting**](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🎓 Examples

### Example 1: Full Stack Feature

```bash
# Epic: User authentication system
/skyfom-orchestrate bd-epic-auth

# Agents spawned:
# - Backend: API endpoints (Hono + Drizzle)
# - Frontend: Login/register UI (React + Shadcn)
# - Mobile: Auth screens (React Native)
# - DevOps: Auth service deployment
# - QA: E2E auth flow tests
```

### Example 2: Mobile App Development

```bash
# Epic: Mobile shopping cart
/skyfom-orchestrate bd-epic-cart --no-human-verify

# Agents spawned:
# - Mobile Dev: Cart screens + state
# - Backend: Cart API endpoints
# - Designer: UI/UX specifications
# - QA: Maestro E2E tests
```

### Example 3: Infrastructure Setup

```bash
# Epic: Kubernetes migration
/skyfom-orchestrate bd-epic-k8s

# Agents spawned:
# - DevOps: K8s manifests, Terraform
# - Backend: Health checks, config
# - QA: Load testing, monitoring
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/skyfom-claude-orchestration.git
cd skyfom-claude-orchestration

# Make scripts executable
chmod +x hooks/scripts/*.sh

# Test locally
cp -r . /path/to/test-project/.claude
cd /path/to/test-project
claude
```

## 🐛 Troubleshooting

### Common Issues

**"bd command not found"**
```bash
# Install Beads CLI
npm install -g beads-cli
# Or check your Beads installation
```

**"gh command not found"**
```bash
# Install GitHub CLI
brew install gh  # macOS
# Or visit https://cli.github.com/
```

**"Permission denied" on hooks**
```bash
chmod +x .claude/hooks/scripts/*.sh
```

**"Maximum agents exceeded"**
```bash
# Wait for agents to complete or stop orchestration
/skyfom-stop-orchestrate
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built for [Claude Code](https://claude.ai/claude-code) by Anthropic
- Inspired by multi-agent systems and agentic workflows
- Community contributions from the Claude Code ecosystem

## 📮 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/discussions)
- **Documentation**: [Full Docs](https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/tree/main/docs)

## 🌟 Star History

If you find this plugin useful, please consider giving it a star!

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/skyfom-claude-orchestration&type=Date)](https://star-history.com/#YOUR_USERNAME/skyfom-claude-orchestration&Date)

---

**Made with ❤️ by the Skyfom Team**
