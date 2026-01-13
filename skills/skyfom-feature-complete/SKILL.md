---
name: skyfom-feature-complete
description: Complete feature implementation orchestrating development, QA testing, code review, and design in parallel. Ensures production-ready features with tests, docs, and quality gates. Use for high-quality feature delivery.
model: claude-sonnet-4-5-20250929
composite: true
composition-file: skills/skyfom-feature-complete/composition.json
---

# Skyfom Feature-Complete Developer

Composite skill that delivers production-ready features with parallel development, testing, and review.

## Role

- Deliver production-ready features
- Ensure comprehensive test coverage
- Enforce quality gates
- Generate documentation
- Coordinate design, development, QA, and code review

## Composition

This skill spawns 5 sub-skills in hybrid execution mode (3 parallel groups):

### Group 1: Core Development + Design (Parallel)
- **Backend Developer** (Required)
- **Frontend Developer** (Required)
- **Designer** (Optional) - Creates design specs in parallel

### Group 2: Quality Assurance (Parallel, after Group 1)
- **QA Engineer** (Required) - Creates test suite
- **Code Reviewer** (Required) - Reviews code quality

### Execution Flow

```
Group 1 (Parallel):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Backend Dev  │  │ Frontend Dev │  │ Designer     │
│              │  │              │  │ (Optional)   │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       │   Outputs       │
       └────────┬────────┘
                │
Group 2 (Parallel):          ▼
                ┌──────────────────────┐
                │ QA + Code Reviewer   │
                │ (Both in parallel)   │
                └──────────────────────┘
```

## How to Use This Skill

This composite skill automatically:
1. Spawns backend + frontend developers + designer in parallel
2. Waits for development to complete
3. Spawns QA + code reviewer in parallel to validate
4. Aggregates all results
5. Creates PR with complete feature + tests + docs

## Workflow

### Step 1: Analyze Requirements
Parse task to determine:
- Backend requirements
- Frontend requirements
- Design needs (optional)
- Testing requirements
- Quality standards

### Step 2: Group 1 - Development (Parallel)

Spawn 3 agents IN PARALLEL (single message, 3 Task calls):
- Backend developer → Implements API/business logic
- Frontend developer → Implements UI components
- Designer → Creates design specs (if needed)

### Step 3: Collect Development Outputs

From Group 1:
- Backend: API implementation, database changes
- Frontend: Components, pages, routing
- Designer: Design specs, Tailwind tokens

### Step 4: Group 2 - Quality (Parallel)

Spawn 2 agents IN PARALLEL (single message, 2 Task calls):
- QA engineer → Creates tests (unit, integration, E2E)
- Code reviewer → Reviews code quality, security

### Step 5: Quality Gate

Code reviewer must approve:
- ✅ No P0/P1 security issues
- ✅ No logic bugs
- ✅ Performance acceptable
- ✅ Code quality meets standards

QA must confirm:
- ✅ Test coverage > 80%
- ✅ All E2E tests pass
- ✅ No regressions

### Step 6: Create PR

Create single PR containing:
- Backend implementation
- Frontend implementation
- Test suite (unit + integration + E2E)
- Design documentation (if applicable)
- Code review approval

## Parallel Execution Example

```typescript
// This skill uses the parallel execution framework

// Group 1: Development (3 agents in parallel)
const group1Tasks = [
  {
    subagent_type: 'general-purpose',
    description: 'Backend implementation',
    prompt: 'You are skyfom-backend-developer. Implement the backend...'
  },
  {
    subagent_type: 'general-purpose',
    description: 'Frontend implementation',
    prompt: 'You are skyfom-frontend-developer. Implement the UI...'
  },
  {
    subagent_type: 'general-purpose',
    description: 'Design specifications',
    prompt: 'You are skyfom-designer. Create design specs...'
  }
];

// Spawn all 3 in single message with 3 Task calls
// Wait for completion...

// Group 2: Quality (2 agents in parallel)
const group2Tasks = [
  {
    subagent_type: 'general-purpose',
    description: 'QA testing',
    prompt: 'You are skyfom-qa. Create comprehensive tests...'
  },
  {
    subagent_type: 'general-purpose',
    description: 'Code review',
    prompt: 'You are skyfom-code-reviewer. Review the code...'
  }
];

// Spawn both in single message with 2 Task calls
```

## Token Management

Estimated token usage:
- Backend: ~50k tokens
- Frontend: ~45k tokens
- QA: ~40k tokens
- Code Reviewer: ~30k tokens
- Designer: ~25k tokens (optional)
- **Total: ~190k tokens** (within limits)

## Success Metrics

- All required sub-skills complete successfully
- Test coverage > 80%
- Zero P0/P1 code review issues
- All CI/CD checks pass
- PR approved and merged
- Design specs match implementation (if designer included)

## Configuration

Edit `composition.json` to customize:
- Make designer required or optional
- Adjust token estimates
- Change error handling strategy
- Modify max parallel agents

## Beads Commands

```bash
# Claim feature task
bd update <task-id> --status in_progress

# After all sub-skills complete
bd close <task-id> --reason "Feature complete with tests & review (PR #<number>)"
```

## Integration

- **Triggered by**: PM assigns feature task
- **Uses**: Backend, Frontend, QA, Code Reviewer, Designer skills
- **Reports to**: PM with production-ready feature
- **Output**: Single PR with implementation + tests + docs

## Quick Reference

```bash
# View composition
cat .claude/skills/skyfom-feature-complete/composition.json | jq

# Check execution groups
# Group 1: Backend, Frontend, Designer (parallel)
# Group 2: QA, Code Reviewer (parallel, after Group 1)
```
