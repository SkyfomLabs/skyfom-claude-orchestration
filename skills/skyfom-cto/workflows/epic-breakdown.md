# Epic Breakdown Workflow

Detailed workflow for breaking down epics into executable tasks.

## Prerequisites

- Epic created in Beads with requirements
- Access to codebase for analysis
- Understanding of existing architecture

## Step-by-Step Process

### 1. Epic Analysis

**Input**: Epic ID from PM

**Actions**:
```bash
# Fetch epic details
bd show <epic-id> --json > /tmp/epic.json

# View epic tree
bd dep tree <epic-id>

# Check codebase context
git log --oneline -20
git status
```

**Extract**:
- User stories
- Acceptance criteria
- Technical constraints
- Business requirements
- Dependencies on other epics

### 2. Requirements Decomposition

**Parse each requirement**:
1. Identify affected components
2. List technical changes needed
3. Note testing requirements
4. Flag integration points
5. Identify risks

**Example**:
```
Requirement: "Users can upload profile photos"

Affected:
- Frontend: Upload UI component
- Backend: File upload endpoint
- Storage: S3/blob storage integration
- Database: User profile table (add photo_url)
- Mobile: Camera integration

Changes:
- Frontend: React component, form handling
- Backend: Multipart upload, validation, resize
- Storage: S3 bucket config, CDN
- Database: Migration for new column

Testing:
- Unit: Upload validation
- Integration: E2E upload flow
- Load: Large file handling
```

### 3. Token Estimation

**For each requirement**:

```bash
# Count characters in description
chars=$(echo "$requirement_description" | wc -c)

# Calculate base tokens
base_tokens=$((chars / 4))

# Adjust for complexity
# Simple CRUD: base_tokens × 1.0
# Business logic: base_tokens × 1.5
# Integration: base_tokens × 2.0
# Complex algorithm: base_tokens × 2.5

estimated_tokens=$((base_tokens * complexity_multiplier))
```

**Complexity multipliers**:
- **1.0**: CRUD operations, simple UI
- **1.5**: Business logic, validation, forms
- **2.0**: External integrations, auth flows
- **2.5**: Complex algorithms, real-time features

### 4. Task Splitting Strategy

**If requirement > 100k tokens, split**:

#### Vertical Slicing (Preferred)
Split by user-facing features:
- Task 1: Upload UI (Frontend)
- Task 2: Upload API (Backend)
- Task 3: Storage integration (Backend)
- Task 4: Mobile upload (Mobile)

#### Horizontal Slicing (When needed)
Split by architectural layer:
- Task 1: Database schema
- Task 2: Backend models
- Task 3: API endpoints
- Task 4: Frontend integration

#### Dependency-First Slicing
Split by dependencies:
- Task 1: Foundation (schema, models)
- Task 2: Core logic (API)
- Task 3: UI layer (components)
- Task 4: Integration (E2E)

### 5. Task Creation

**For each task**:

```bash
bd create "Component: Action" \
  -t task \
  -p $priority \
  -d "## Token Estimate
~${tokens}k tokens

## Requirements
- Requirement 1
- Requirement 2

## Implementation
- Step 1
- Step 2

## Dependencies
- Blocks: bd-xyz
- Blocked by: bd-abc

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests passing
- [ ] Documented

## Technical Notes
$implementation_notes" \
  --json

# Capture task ID
task_id=$(extract_id_from_output)

# Link to epic
bd dep add $task_id <epic-id> --type parent-child
```

### 6. Dependency Mapping

**Create dependency chain**:

```bash
# Task B blocks Task A (A depends on B)
bd dep add bd-task-a bd-task-b --type blocks

# Task C discovered from Task D
bd dep add bd-task-c bd-task-d --type discovered-from
```

**Dependency types**:
- **blocks**: Task A cannot start until Task B is done
- **parent-child**: Task is subtask of epic
- **discovered-from**: Task found while working on another

**Validate**:
```bash
# Check for circular dependencies
bd dep tree <epic-id>

# Ensure all tasks linked to epic
bd list --parent <epic-id>
```

### 7. Skill Assignment

**Assign skill requirements to each task**:

| Task Type | Skill |
|-----------|-------|
| Frontend UI | skyfom-frontend-developer |
| Backend API | skyfom-backend-developer |
| Mobile | skyfom-mobile-developer |
| Infrastructure | skyfom-devops |
| Architecture | skyfom-cto |
| Database | skyfom-backend-developer |
| Testing | skyfom-qa |

**Add to task description**:
```markdown
## Required Skills
- skyfom-backend-developer
- skyfom-devops (for deployment)
```

### 8. Priority Assignment

**Priority levels**:
- **P0**: Blocker, critical path
- **P1**: Important, main features
- **P2**: Nice to have, enhancements
- **P3**: Optional, future improvements

**Priority factors**:
1. Business value
2. Dependencies (foundation first)
3. Risk level (risky early)
4. Resource availability

### 9. Architecture Decision Records

**Create ADR for major decisions**:

```bash
# Copy template
cp .claude/skills/skyfom-cto/templates/adr-template.md \
   docs/architecture/decisions/ADR-001-upload-storage.md

# Edit ADR with decision details
# - Context: Why decision needed
# - Decision: What was decided
# - Consequences: Trade-offs
# - Alternatives: Other options considered
```

**When to create ADR**:
- Technology choice
- Architecture pattern
- Data model design
- Integration approach
- Performance strategy

### 10. Technical Specification

**Create tech spec for complex tasks**:

See `templates/tech-spec-template.md`

**Include**:
- API changes (endpoints, schemas)
- Database changes (migrations, indexes)
- Component changes (new/modified files)
- Sequence diagrams
- Testing strategy
- Rollout plan
- Monitoring approach

### 11. Review & Validation

**Checklist**:
- [ ] All requirements covered by tasks
- [ ] All tasks <100k token estimate
- [ ] Dependencies properly mapped
- [ ] No circular dependencies
- [ ] Skills assigned to all tasks
- [ ] Priorities set
- [ ] ADRs created for major decisions
- [ ] Tech specs for complex features

**Get PM approval**:
- Present task breakdown
- Review dependencies
- Discuss priorities
- Confirm timeline

### 12. Handoff to PM

**Provide to PM**:
1. List of created task IDs
2. Dependency graph
3. Estimated timeline
4. Risk assessment
5. ADRs for review

**PM next steps**:
- Assign tasks to ready queue
- Spawn agents for execution
- Monitor progress

## Example: User Authentication Epic

**Epic**: Add user authentication system

**Requirements**:
1. Email/password login
2. Session management
3. Password reset
4. OAuth (Google, GitHub)
5. 2FA support

**Token Estimation**:
- Login: 35k tokens
- Sessions: 25k tokens
- Password reset: 20k tokens
- OAuth: 45k tokens
- 2FA: 30k tokens
**Total**: 155k tokens → Split required

**Task Breakdown**:
```bash
# Task 1: Database schema (Foundation)
bd create "Auth: Database schema and migrations" -t task -p 0 \
  -d "Token Est: ~15k\n\nCreate users, sessions, oauth_providers tables" \
  --json

# Task 2: Password authentication (Core)
bd create "Auth: Email/password login" -t task -p 1 \
  -d "Token Est: ~35k\n\nImplement login, hashing, validation" \
  --json

# Task 3: Session management (Core)
bd create "Auth: Session management" -t task -p 1 \
  -d "Token Est: ~25k\n\nJWT tokens, refresh logic, middleware" \
  --json

# Task 4: Password reset (Feature)
bd create "Auth: Password reset flow" -t task -p 2 \
  -d "Token Est: ~20k\n\nEmail tokens, reset form, validation" \
  --json

# Task 5: OAuth integration (Feature)
bd create "Auth: OAuth providers" -t task -p 2 \
  -d "Token Est: ~45k\n\nGoogle & GitHub OAuth, callback handling" \
  --json

# Task 6: 2FA (Feature)
bd create "Auth: Two-factor authentication" -t task -p 2 \
  -d "Token Est: ~30k\n\nTOTP, QR codes, backup codes" \
  --json

# Create dependencies
bd dep add bd-task-2 bd-task-1 --type blocks  # Login depends on schema
bd dep add bd-task-3 bd-task-2 --type blocks  # Sessions depend on login
bd dep add bd-task-4 bd-task-1 --type blocks  # Reset depends on schema
bd dep add bd-task-5 bd-task-1 --type blocks  # OAuth depends on schema
bd dep add bd-task-6 bd-task-3 --type blocks  # 2FA depends on sessions

# Link all to epic
for task in bd-task-{1..6}; do
  bd dep add $task <epic-id> --type parent-child
done
```

**ADRs Created**:
- ADR-001: Use JWT for session tokens
- ADR-002: Use Argon2 for password hashing
- ADR-003: OAuth library selection (Passport.js)

**Result**:
- 6 tasks, all <50k tokens
- Clear dependency chain
- Foundation → Core → Features
- Skills assigned (all Backend)
- Estimated 2 weeks total

## Token Optimization Tips

1. **Break UI from logic**: Separate component from business logic
2. **Split by platform**: Web, mobile, desktop as separate tasks
3. **Database first**: Schema changes as separate foundation task
4. **Test separately**: Testing can be its own task if complex
5. **Documentation last**: Docs can be follow-up task

## Common Patterns

### Pattern 1: CRUD Feature
```
Task 1: Database schema (15k)
Task 2: Backend API (40k)
Task 3: Frontend UI (35k)
Task 4: Tests (20k)
Total: 110k → 4 tasks
```

### Pattern 2: Integration Feature
```
Task 1: Research & design (20k)
Task 2: Backend integration (60k)
Task 3: Error handling (25k)
Task 4: Frontend integration (40k)
Total: 145k → 4 tasks
```

### Pattern 3: Refactoring
```
Task 1: Extract service layer (50k)
Task 2: Update tests (30k)
Task 3: Migrate consumers (40k)
Total: 120k → 3 tasks
```

## Success Metrics

- Epic completion time
- Task size accuracy
- Dependency correctness
- ADR quality
- PM satisfaction with breakdown
