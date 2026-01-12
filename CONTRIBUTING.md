# Contributing to Skyfom Orchestration

Thank you for your interest in contributing to Skyfom Orchestration! This document provides guidelines for contributing to the project.

## 🌟 Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or improvements
- 📝 Improve documentation
- 🔧 Submit bug fixes
- ✨ Add new agent skills
- 🎨 Enhance existing skills
- 🧪 Write tests
- 📦 Create example workflows

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/skyfom-claude-orchestration.git
cd skyfom-claude-orchestration
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

- Follow the existing code style
- Keep SKILL.md files under 200 lines
- Place detailed workflows in `workflows/` subdirectories
- Add tests if applicable
- Update documentation

### 4. Test Your Changes

```bash
# Copy to a test project
cp -r . /path/to/test-project/.claude

# Test the plugin
cd /path/to/test-project
claude
/skyfom-orchestrate test-epic-id
```

### 5. Commit Your Changes

Follow conventional commit format:

```bash
git commit -m "feat: add new backend skill for GraphQL"
git commit -m "fix: resolve token calculation error"
git commit -m "docs: update installation instructions"
git commit -m "refactor: improve hook validation logic"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📋 Pull Request Guidelines

### PR Title Format

```
feat: add PostgreSQL skill
fix: resolve agent spawning race condition
docs: improve README installation section
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2

## Testing
How have you tested these changes?

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Tested locally
```

## 🎯 Skill Development Guidelines

### Creating a New Skill

1. **Structure** (keep SKILL.md <200 lines):

```
skills/skyfom-your-skill/
├── SKILL.md                    # <200 lines
├── workflows/                  # Detailed processes
│   └── main-workflow.md
├── templates/                  # Reusable templates
│   └── task-template.md
└── reference/                  # Commands, examples
    └── best-practices.md
```

2. **SKILL.md Template**:

```markdown
---
name: skyfom-your-skill
description: Brief description (one line)
model: claude-sonnet-4-5-20250929
---

# Skyfom [Skill Name]

Brief overview

## Role
- Responsibility 1
- Responsibility 2

## Tech Stack
| Category | Technology |
|----------|------------|
| ... | ... |

## Workflow
See `workflows/main-workflow.md`

### Quick Workflow
1. Step 1
2. Step 2

## Integration
- Triggered by: ...
- Reports to: ...

## Quick Reference
```bash
# Commands
```

## Success Metrics
- Metric 1
- Metric 2
```

3. **Follow Existing Patterns**:
- Look at existing skills for reference
- Maintain consistent formatting
- Use tables for structured data
- Reference external files for details

## 🧪 Testing Guidelines

### Manual Testing

```bash
# Test in isolated environment
mkdir test-project
cd test-project
git init
cp -r /path/to/skyfom-orchestration .claude

# Test commands
claude
/skyfom-orchestrate bd-test-epic
```

### Integration Testing

- Test with real Beads epics
- Test with different project types
- Test error handling
- Test edge cases (max agents, token limits)

## 📝 Documentation Guidelines

### Update Documentation When:

- Adding new features
- Changing existing behavior
- Adding new skills
- Modifying configuration options
- Fixing bugs that affect usage

### Documentation Locations:

- `README.md` - Overview, installation, quick start
- `SKILL.md` files - Individual skill documentation
- `workflows/*.md` - Detailed process documentation
- `reference/*.md` - Command references, best practices

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what happened

**To Reproduce**
Steps to reproduce:
1. Run command '...'
2. See error

**Expected behavior**
What should have happened

**Environment:**
- Claude Code version:
- OS:
- Beads version:
- Plugin version:

**Logs**
```
Paste relevant logs from .claude/state/events.jsonl
```

**Additional context**
Any other relevant information
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Use case**
How would you use this feature?

**Additional context**
Any other relevant information
```

## 🔍 Code Review Process

1. **Maintainer reviews PR**
2. **Feedback provided** (if needed)
3. **Changes requested** (if needed)
4. **Approval** when ready
5. **Merge** to main branch

### Review Criteria

- Code quality
- Documentation completeness
- Test coverage
- Breaking changes handled
- Performance impact
- Security considerations

## 🏷️ Version Numbering

We use Semantic Versioning (SemVer):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backward compatible)
- **PATCH** (0.0.1): Bug fixes

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Unprofessional conduct

## 📞 Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/discussions)
- **Bugs**: Open a [GitHub Issue](https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/issues)
- **Chat**: Join our community [Discord/Slack] (if available)

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Happy Contributing! 🚀**
