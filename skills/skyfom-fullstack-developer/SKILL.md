---
name: skyfom-fullstack-developer
description: Full-stack developer orchestrating backend, frontend, and mobile development in parallel. Coordinates API development, web UI, and mobile apps. Use for features requiring multiple platforms.
model: claude-sonnet-4-5-20250929
composite: true
composition-file: skills/skyfom-fullstack-developer/composition.json
---

# Skyfom Full-Stack Developer

Composite skill that orchestrates backend, frontend, and mobile development in parallel.

## Role

- Coordinate multi-platform feature development
- Ensure API consistency across platforms
- Manage shared data models
- Synchronize releases across backend/frontend/mobile

## Composition

This skill spawns 3 sub-skills in a hybrid execution mode:

1. **Backend Developer** (Required) - Runs first
   - Creates API endpoints
   - Designs database schema
   - Outputs: API specification, database schema

2. **Frontend Developer** (Required) - Depends on Backend
   - Implements web UI
   - Consumes backend APIs
   - Integrates with design system

3. **Mobile Developer** (Optional) - Depends on Backend
   - Implements mobile app
   - Consumes backend APIs
   - Follows platform guidelines

### Execution Flow

```
┌─────────────────────────┐
│ Backend Developer       │  ← Starts first (required)
│ (API + Database)        │
└───────────┬─────────────┘
            │ Outputs: API spec, DB schema
            ├──────────────┬──────────────┐
            ▼              ▼              ▼
┌─────────────────┐  ┌─────────────────┐
│ Frontend Dev    │  │ Mobile Dev      │  ← Run in parallel after backend
│ (Web UI)        │  │ (iOS + Android) │
└─────────────────┘  └─────────────────┘
```

## How to Use This Skill

### Invocation

This is a **composite skill**. When invoked, it will:

1. Read the task requirements
2. Parse the composition.json file
3. Execute the backend developer first
4. Once backend completes, spawn frontend and mobile developers IN PARALLEL
5. Collect results from all sub-skills
6. Aggregate into final deliverable

### Example Usage

```markdown
/skyfom-orchestrate bd-epic-123

# PM assigns a full-stack task to this skill:
# "Implement user authentication across all platforms"

# This skill will:
# 1. Spawn backend-developer: Create auth API + JWT + DB schema
# 2. Wait for backend completion
# 3. Spawn frontend-developer + mobile-developer IN PARALLEL:
#    - Frontend: Login/register UI components
#    - Mobile: Auth screens for iOS/Android
# 4. Aggregate results and create unified PR or separate PRs
```

## Parallel Execution

This skill uses the parallel execution framework from `orchestrator/parallel-executor.ts`.

**Key Features:**
- True parallel spawning (single message, multiple Task calls)
- Dependency management (frontend/mobile wait for backend)
- Error handling (fail-fast if backend fails)
- Token tracking across all sub-skills
- Results aggregation

## Workflow

See `orchestrator/parallel-executor.ts` for the execution engine.

### Step 1: Claim Task
```bash
bd update <task-id> --status in_progress
```

### Step 2: Analyze Requirements
Parse task to determine:
- Backend API needs
- Frontend UI requirements
- Mobile features (if applicable)

### Step 3: Execute Composition

```typescript
// Load composition
const composition = require('./composition.json');

// Plan execution order (respects dependencies)
const executionGroups = planExecutionOrder(composition.subSkills);

// Group 1: Backend (no dependencies)
// Group 2: Frontend + Mobile (depend on backend)

// Spawn Group 1
const backendSpec = generateParallelTaskSpecs(
  executionGroups[0],
  { taskId, requirements }
);

// Spawn backend agent
// Wait for completion...

// Spawn Group 2 IN PARALLEL
const parallelSpecs = generateParallelTaskSpecs(
  executionGroups[1],
  { taskId, requirements, sharedContext: { apiSpec } }
);

// Spawn frontend + mobile agents in SINGLE message
// (Multiple Task tool calls in one response)
```

### Step 4: Coordinate Results

Collect outputs from all sub-skills:
- Backend: API endpoints, migrations
- Frontend: React components, pages
- Mobile: React Native screens

### Step 5: Create PR(s)

Options:
1. **Single PR**: All changes in one PR (recommended for small features)
2. **Separate PRs**: Backend PR + Frontend PR + Mobile PR (for large features)

### Step 6: Report Completion
```bash
bd close <task-id> --reason "PR #<number> created (full-stack)"
```

## Token Management

Estimated token usage:
- Backend: ~75k tokens
- Frontend: ~60k tokens
- Mobile: ~65k tokens
- **Total: ~200k tokens** (at upper limit)

If approaching limits:
- Split into separate tasks
- Make mobile optional
- Use token-efficiency skill to optimize

## Success Metrics

- All platforms implement the same feature consistently
- API contracts match across frontend/mobile
- Tests pass on all platforms
- Shared data models are synchronized
- PRs approved by code reviewer
- Total token usage < 200k

## Integration

- **Triggered by**: PM assigns full-stack task
- **Uses**: Backend, Frontend, Mobile developer skills
- **Reports to**: PM with integrated results
- **Code review**: Triggers skyfom-code-reviewer for all platforms

## Error Handling

- **Backend fails**: Abort entire task (frontend/mobile can't proceed)
- **Frontend fails**: Mobile can still complete (or vice versa)
- **Mobile fails**: Not critical if mobile is optional
- **Retry strategy**: Max 1 retry per sub-skill

## Beads Commands

```bash
# Claim full-stack task
bd update <task-id> --status in_progress

# Create branch for full-stack work
git checkout -b feature/<task-id>-fullstack

# After all sub-skills complete
git commit -m "feat(fullstack): implement <feature> across platforms (bd-<task-id>)"
git push origin feature/<task-id>-fullstack

# Close task
bd close <task-id> --reason "PR #<number> created (backend+frontend+mobile)"
```

## Configuration

Edit `composition.json` to customize:
- `maxParallel`: Number of sub-skills to run simultaneously
- `executionMode`: parallel, sequential, or hybrid
- `coordinationStrategy.errorHandling`: fail-fast, continue-on-error, or retry
- `subSkills[].required`: Make mobile optional if not always needed

## Quick Reference

```bash
# View composition
cat .claude/skills/skyfom-fullstack-developer/composition.json | jq

# Validate composition
# (automatically validated when skill loads)

# Estimate total tokens
cat .claude/skills/skyfom-fullstack-developer/composition.json | \
  jq '[.subSkills[].tokenEstimate] | add'
```
