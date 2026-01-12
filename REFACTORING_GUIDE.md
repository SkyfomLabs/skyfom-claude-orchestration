# Skill Refactoring Guide

Complete guide for refactoring all Skyfom skills to <200 lines with workflow definitions.

## Overview

Refactor 11 skills from verbose (750+ lines) to concise (<200 lines) format with detailed workflows in separate files.

## Status

- ✅ skyfom-pm-agent-orchestrator (190 lines) - DONE
- ✅ skyfom-tokens-efficiency (180 lines) - DONE
- ✅ skyfom-code-reviewer (680 lines) - EXISTS, needs refactoring
- ⏳ skyfom-cto - TO DO
- ⏳ skyfom-frontend-developer - TO DO
- ⏳ skyfom-backend-developer - TO DO
- ⏳ skyfom-mobile-developer - TO DO
- ⏳ skyfom-desktop-developer - TO DO
- ⏳ skyfom-devops - TO DO
- ⏳ skyfom-qa - TO DO
- ⏳ skyfom-research - TO DO
- ⏳ skyfom-designer - TO DO

## Standard Structure

Each skill should follow this structure:

```
skills/skyfom-<name>/
├── SKILL.md (<200 lines)
├── workflows/
│   ├── main-workflow.md (detailed steps)
│   ├── error-handling.md (recovery procedures)
│   └── examples.md (real-world examples)
├── templates/
│   ├── task-template.md
│   ├── pr-template.md
│   └── commit-template.md
└── reference/
    ├── commands.md (quick reference)
    ├── tech-stack.md (technologies)
    └── best-practices.md (guidelines)
```

## SKILL.md Template (<200 lines)

```markdown
---
name: skyfom-<skill-name>
description: [One-sentence description for orchestrator. Mention key tech, main use case, integration points]
model: claude-sonnet-4-5-20250929
---

# Skyfom [Skill Name]

[2-3 sentence overview]

## Role

[Bullet points of responsibilities]

## Core Responsibilities

| Area | Actions |
|------|---------|
| [Area 1] | [Actions] |
| [Area 2] | [Actions] |

## Workflow

See `workflows/main-workflow.md` for detailed steps.

### Quick Workflow
1. Step 1
2. Step 2
3. Step 3

## Tech Stack

| Category | Technology |
|----------|------------|
| [Category] | [Tech] |

## Beads Commands

```bash
bd ready --json
bd show <id> --json
bd update <id> --status in_progress
bd close <id> --reason "Done"
```

## Integration

Works with orchestration:
- Triggered by: [when/how]
- Reports to: [who/where]
- Updates: [what state]

## Quick Reference

```bash
# Most common commands
[command 1]
[command 2]
```

## Success Metrics

- [Metric 1]
- [Metric 2]
```

## Refactoring Steps

### 1. Backup Existing Skill

```bash
cd .claude/skills/skyfom-<name>
mv SKILL.md SKILL.md.backup
```

### 2. Create Directory Structure

```bash
mkdir -p workflows templates reference
```

### 3. Extract Content

From existing SKILL.md.backup:

**Move to workflows/main-workflow.md**:
- Detailed workflow steps
- Multi-step procedures
- Decision trees
- State transitions

**Move to templates/**:
- Task templates
- PR templates
- Commit message formats
- Report templates

**Move to reference/**:
- Command reference tables
- Technology stack details
- Best practices lists
- Coding standards

### 4. Write Concise SKILL.md

Create new SKILL.md with:
- Frontmatter (name, description, model)
- Brief overview (2-3 sentences)
- Role and responsibilities (bullet points)
- Quick workflow (numbered steps)
- Tech stack (table)
- Integration notes
- Quick reference commands
- Success metrics

Target: <200 lines

### 5. Create Detailed Workflows

**workflows/main-workflow.md**:
- Comprehensive step-by-step instructions
- Prerequisites
- Detailed commands with explanations
- Error handling procedures
- State transitions
- Metrics tracking

**workflows/error-handling.md**:
- Common errors and solutions
- Recovery procedures
- Escalation paths
- Debugging steps

**workflows/examples.md**:
- Real-world examples
- Use cases
- Before/after comparisons

### 6. Validate

Check that:
- SKILL.md is <200 lines
- All workflow details preserved in workflows/
- Templates are usable
- References are accurate
- Integration points documented

## Example: Refactoring skyfom-cto

### Before (640 lines, everything in SKILL.md)

```markdown
---
name: skyfom-cto
description: Senior architect and CTO...
---

# Skyfom CTO / Architect

[Long description...]

## Responsibilities

[Verbose list...]

## Document Types

[Full templates inline...]

## Workflow

[500+ lines of detailed steps...]

## Epic Breakdown Example

[200+ lines of examples...]

## Technical Spec Template

[100+ lines of template...]
```

### After (<200 lines SKILL.md + separate files)

**SKILL.md** (185 lines):
```markdown
---
name: skyfom-cto
description: Senior architect for epic breakdown, ADR creation, and technical planning. Analyzes epics, creates subtasks <100k tokens, documents architecture decisions, reviews PRs for compliance.
model: claude-sonnet-4-5-20250929
---

# Skyfom CTO / Architect

Architect responsible for epic breakdown and technical planning.

## Role

- Epic analysis and task decomposition
- Architecture decision records (ADRs)
- Technical specification creation
- PR architectural review
- Token estimation for tasks

## Core Responsibilities

| Area | Actions |
|------|---------|
| Planning | Break epics into tasks <100k tokens |
| Architecture | Create ADRs, system design docs |
| Review | Verify architectural compliance |
| Estimation | Calculate token/complexity estimates |

## Workflow

See `workflows/epic-breakdown.md` for detailed steps.

### Quick Workflow
1. Read epic from Beads
2. Analyze requirements and dependencies
3. Estimate complexity and tokens
4. Break into tasks (<100k tokens each)
5. Create tasks with dependencies in Beads
6. Document architecture decisions

## Tech Stack

All platforms:
- TypeScript, Rust, Python, Go, Swift, Kotlin
- Frontend: React, Svelte, Next.js
- Backend: Hono, Actix, FastAPI
- Mobile: React Native, SwiftUI
- Database: PostgreSQL, Drizzle, Diesel

## Beads Commands

```bash
bd show <epic-id> --json
bd create "Task" -t task -p 1 -d "Description" --json
bd dep add <task> <epic> --type parent-child
bd dep add <task-b> <task-a> --type blocks
```

## Integration

- Triggered by: PM during epic planning phase
- Reports to: PM with task breakdown
- Creates: Tasks in Beads with dependencies
- Documents: ADRs in `docs/architecture/decisions/`

## Quick Reference

```bash
# Analyze epic
bd show <epic-id> --json

# Estimate tokens
chars=$(echo "$description" | wc -c)
tokens=$((chars / 4))

# Create task
bd create "Title" -t task -p 1 \
  -d "## Est: ~${tokens}k tokens\n\n$details" \
  --json

# Link to epic
bd dep add <task-id> <epic-id> --type parent-child
```

## Success Metrics

- All tasks <100k token estimate
- Clear dependencies defined
- Zero circular dependencies
- All tasks have acceptance criteria
- ADRs created for major decisions
```

**workflows/epic-breakdown.md** (detailed 300+ lines)
**templates/adr-template.md** (ADR template)
**templates/task-template.md** (task creation template)
**reference/architecture-patterns.md** (patterns guide)

## Refactoring Checklist

For each skill:

- [ ] Backup existing SKILL.md
- [ ] Create directory structure (workflows/, templates/, reference/)
- [ ] Extract detailed workflows to workflows/main-workflow.md
- [ ] Extract error handling to workflows/error-handling.md
- [ ] Extract templates to templates/
- [ ] Extract reference material to reference/
- [ ] Write concise SKILL.md (<200 lines)
- [ ] Validate:
  - [ ] SKILL.md < 200 lines
  - [ ] Frontmatter complete (name, description, model)
  - [ ] Clear role and responsibilities
  - [ ] Quick workflow steps
  - [ ] Tech stack listed
  - [ ] Integration documented
  - [ ] Quick reference commands
  - [ ] Success metrics defined
- [ ] Test skill with orchestration
- [ ] Update ORCHESTRATION_IMPLEMENTATION.md status

## Automation Script

To help refactor remaining skills:

```bash
#!/bin/bash
# refactor-skill.sh <skill-name>

SKILL=$1
SKILL_DIR="skills/skyfom-$SKILL"

echo "Refactoring $SKILL..."

# Backup
cp "$SKILL_DIR/SKILL.md" "$SKILL_DIR/SKILL.md.backup"

# Create structure
mkdir -p "$SKILL_DIR"/{workflows,templates,reference}

# Create placeholder files
cat > "$SKILL_DIR/workflows/main-workflow.md" <<'EOF'
# Main Workflow

[Extract detailed workflow steps from SKILL.md.backup]
EOF

cat > "$SKILL_DIR/templates/task-template.md" <<'EOF'
# Task Template

[Extract task templates from SKILL.md.backup]
EOF

cat > "$SKILL_DIR/reference/commands.md" <<'EOF'
# Quick Reference

[Extract command reference from SKILL.md.backup]
EOF

echo "Created structure for $SKILL"
echo "Now manually edit $SKILL_DIR/SKILL.md to be <200 lines"
echo "Move detailed content to workflows/, templates/, reference/"
```

## Priority Order

Refactor in this order:

1. ✅ skyfom-pm-agent-orchestrator (DONE)
2. ✅ skyfom-tokens-efficiency (DONE)
3. **skyfom-cto** (next) - Critical for epic breakdown
4. **skyfom-frontend-developer** - Common use case
5. **skyfom-backend-developer** - Common use case
6. **skyfom-code-reviewer** - Quality gate
7. **skyfom-mobile-developer** - Platform coverage
8. **skyfom-devops** - Infrastructure
9. **skyfom-qa** - Quality assurance
10. **skyfom-desktop-developer** - Platform coverage
11. **skyfom-research** - Planning phase
12. **skyfom-designer** - Design phase

## Testing Refactored Skills

After refactoring, test each skill:

1. **Standalone test**:
   ```bash
   # Verify SKILL.md renders correctly
   cat skills/skyfom-<name>/SKILL.md
   ```

2. **Orchestration test**:
   ```bash
   # Create test epic
   bd create "Test Epic" -t epic -p 1 --json

   # Run orchestration
   /skyfom-orchestrate bd-<epic-id>

   # Verify skill invoked correctly
   ```

3. **Validation**:
   - SKILL.md displays in skill listing
   - Workflow files accessible
   - Templates usable
   - Integration works

## Next Steps

1. Refactor remaining 9 skills using this guide
2. Test each skill with orchestration
3. Document any issues in ORCHESTRATION_IMPLEMENTATION.md
4. Run full end-to-end test with real epic
5. Optimize based on actual usage metrics
