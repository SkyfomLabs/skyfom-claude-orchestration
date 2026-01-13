# Parallel Execution Framework

Comprehensive guide to parallel agent execution in Skyfom Orchestration.

## Overview

The Skyfom Orchestration system supports three levels of parallelism:

1. **PM Level**: Project Manager spawning up to 7 developers in parallel
2. **Skill Composition**: Composite skills orchestrating multiple sub-skills
3. **Sub-Skill Spawning**: Any skill spawning specialized sub-agents in parallel

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│ PM Orchestrator                                           │
│ ├─ Spawn 7 developers in parallel                        │
│ └─ Single message with 7 Task calls                      │
└───────────────┬──────────────────────────────────────────┘
                │
    ┌───────────┼───────────┬───────────┬───────────┐
    ▼           ▼           ▼           ▼           ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│Backend │  │Frontend│  │Mobile  │  │DevOps  │  │Fullstack│ (Composite)
└────────┘  └────────┘  └────────┘  └────────┘  └───┬────┘
                                                     │
                         ┌───────────────────────────┤
                         │                           │
                         ▼                           ▼
                    ┌─────────┐               ┌──────────┐
                    │Backend  │               │Frontend  │
                    │Sub-skill│               │Sub-skill │
                    └─────────┘               └──────────┘
```

## Level 1: PM Parallel Orchestration

The PM orchestrator coordinates multiple developers working in parallel.

### Maximum Concurrency
- **Hard Limit**: 7 parallel agents
- **Recommended**: 3-5 agents for optimal resource usage
- **Minimum**: 1 agent (sequential execution)

### Implementation

See: `skills/skyfom-pm-agent-orchestrator/workflows/parallel-spawning-guide.md`

**Pattern**:
1. Get ready tasks from Beads
2. Select up to 7 independent tasks
3. Prepare task specifications
4. Spawn ALL agents in SINGLE message with multiple Task calls
5. Track agent status
6. Collect results as agents complete

**Critical Rule**: ALL Task tool calls must be in the SAME message for true parallel execution.

### Example: PM Spawns 5 Developers

```markdown
I have 5 ready tasks. Spawning 5 developers in parallel:

1. Backend - Auth API (bd-101)
2. Frontend - Dashboard (bd-102)
3. Mobile - Profile (bd-103)
4. DevOps - K8s config (bd-104)
5. Backend - Payment API (bd-105)

Using single message with 5 Task calls for simultaneous execution.
```

Then make 5 Task tool invocations in the same response.

## Level 2: Skill Composition

Composite skills orchestrate multiple sub-skills with dependency management.

### Composite Skill Structure

Defined in `composition.json`:
```json
{
  "name": "skyfom-fullstack-developer",
  "executionMode": "hybrid",
  "maxParallel": 3,
  "subSkills": [
    {
      "skillName": "skyfom-backend-developer",
      "dependencies": [],
      "required": true
    },
    {
      "skillName": "skyfom-frontend-developer",
      "dependencies": ["skyfom-backend-developer"],
      "required": true
    }
  ]
}
```

### Execution Modes

1. **Parallel**: All sub-skills execute simultaneously
   - Use when: Sub-skills are completely independent
   - Example: Backend + Frontend + Mobile (API-first approach)

2. **Sequential**: Sub-skills execute one after another
   - Use when: Each sub-skill depends on previous completion
   - Example: Design → Development → Testing → Deployment

3. **Hybrid**: Respects dependencies, parallelizes when possible
   - Use when: Some sub-skills have dependencies, others don't
   - Example: Backend first, then Frontend + Mobile in parallel

### Dependency Resolution

The framework automatically determines execution order:

```typescript
import { planExecutionOrder } from './orchestrator/parallel-executor';

const subSkills = [
  { skillName: 'backend', dependencies: [] },
  { skillName: 'frontend', dependencies: ['backend'] },
  { skillName: 'mobile', dependencies: ['backend'] },
  { skillName: 'tests', dependencies: ['frontend', 'mobile'] }
];

const groups = planExecutionOrder(subSkills);
// Returns:
// Group 1: [backend]
// Group 2: [frontend, mobile]  // Parallel after backend
// Group 3: [tests]              // After frontend and mobile
```

### Composite Skill Examples

#### Full-Stack Developer
- **Location**: `skills/skyfom-fullstack-developer/`
- **Sub-skills**: Backend, Frontend, Mobile
- **Mode**: Hybrid
- **Flow**: Backend first, then Frontend + Mobile in parallel

#### Feature-Complete Developer
- **Location**: `skills/skyfom-feature-complete/`
- **Sub-skills**: Backend, Frontend, QA, Code Reviewer, Designer
- **Mode**: Hybrid
- **Flow**:
  - Group 1: Backend + Frontend + Designer (parallel)
  - Group 2: QA + Code Reviewer (parallel, after Group 1)

## Level 3: Sub-Skill Spawning

Any skill can spawn specialized sub-agents for specific subtasks.

### Use Cases

1. **Backend splits work**:
   - API implementation agent
   - Database migration agent
   - Documentation agent

2. **Frontend splits work**:
   - Component implementation agent
   - Test creation agent
   - Storybook documentation agent

3. **QA splits work**:
   - Unit test agent
   - E2E test agent
   - Performance test agent

### Implementation Pattern

From within any skill:

```markdown
I need to implement this feature across 3 areas. I'm spawning 3
specialized sub-agents IN PARALLEL (single message, 3 Task calls):

1. Component implementation
2. Test suite creation
3. Documentation generation

All three will work simultaneously on different files.
```

Then make 3 Task tool calls in the same response.

## Framework Utilities

### orchestrator/parallel-executor.ts

Core utilities for parallel execution:

#### generateParallelSpawnPrompt()
Creates instructions for parallel spawning.

```typescript
const tasks = [
  { subagent_type: 'general-purpose', description: 'API', prompt: '...' },
  { subagent_type: 'general-purpose', description: 'UI', prompt: '...' }
];

const prompt = generateParallelSpawnPrompt(tasks);
// Returns clear instructions for parallel execution
```

#### planExecutionOrder()
Resolves dependencies and groups skills for parallel execution.

```typescript
const groups = planExecutionOrder(subSkills);
// Returns: SubSkillDefinition[][]
// Each group can execute in parallel
```

#### generateParallelTaskSpecs()
Converts sub-skill definitions to Task specs.

```typescript
const specs = generateParallelTaskSpecs(subSkills, {
  taskId: 'bd-123',
  requirements: 'Feature description',
  sharedContext: { apiVersion: 'v2' }
});
// Returns: ParallelTaskSpec[]
```

#### validateSkillComposition()
Validates composition for circular dependencies and constraints.

```typescript
const { valid, errors } = validateSkillComposition(composition);
if (!valid) {
  console.error('Invalid composition:', errors);
}
```

#### estimateCompositionTokens()
Calculates total token estimate for composite skill.

```typescript
const tokens = estimateCompositionTokens(composition);
// Returns: number (total estimated tokens)
```

### orchestrator/skill-composition-schema.json

JSON Schema for validating composition files.

Validates:
- Required fields
- Execution modes
- Dependencies
- Token estimates
- Coordination strategies

## Best Practices

### 1. Maximize Parallelism

✅ **Do**: Spawn independent tasks in parallel
```
Single message:
- Backend API agent
- Frontend UI agent
- Mobile app agent
```

❌ **Don't**: Spawn tasks with dependencies in parallel
```
Single message:
- Database migration agent
- API implementation agent (needs migration to complete first)
```

### 2. Use run_in_background

✅ **Do**: Set run_in_background: true for parallel agents
```typescript
{
  subagent_type: 'general-purpose',
  description: 'Backend implementation',
  prompt: '...',
  run_in_background: true  // ✅ Allows parallel execution
}
```

❌ **Don't**: Use blocking execution for parallel tasks
```typescript
{
  run_in_background: false  // ❌ Blocks other agents
}
```

### 3. Track All Agents

Update state tracking:
```bash
# After spawning agents
echo '{
  "id": "agent-001",
  "skillName": "skyfom-backend-developer",
  "taskId": "bd-123",
  "status": "running",
  "spawnedAt": "'$(date -Iseconds)'"
}' >> .claude/state/agents.json
```

### 4. Respect Agent Limits

- PM level: Max 7 agents
- Composite skill: Respects maxParallel setting
- Sub-skill spawning: Include in total count

### 5. Handle Errors Gracefully

Strategies:
- **fail-fast**: Abort on first failure (default)
- **continue-on-error**: Complete all agents, report failures
- **retry**: Retry failed agents up to maxRetries

Set in composition.json:
```json
{
  "coordinationStrategy": {
    "errorHandling": "fail-fast",
    "maxRetries": 2
  }
}
```

## Performance Metrics

### Sequential vs Parallel Execution

**Scenario**: 7 developers, 30 minutes each

Sequential (wrong):
```
Developer 1:  0:00 - 0:30
Developer 2:  0:30 - 1:00
Developer 3:  1:00 - 1:30
Developer 4:  1:30 - 2:00
Developer 5:  2:00 - 2:30
Developer 6:  2:30 - 3:00
Developer 7:  3:00 - 3:30
Total: 3 hours 30 minutes
```

Parallel (correct):
```
All 7 developers: 0:00 - 0:30
Total: 30 minutes
```

**Performance gain: 7x faster** ⚡

### Token Efficiency

Parallel execution doesn't increase token usage, but allows:
- Faster completion (lower wall-clock time)
- Better resource utilization
- Reduced idle time

## Monitoring Parallel Execution

### View Active Agents
```bash
cat .claude/state/agents.json | jq '.[] | select(.status == "running")'
```

### Monitor Progress
```bash
tail -f .claude/state/events.jsonl
```

### Check Completion
```bash
cat .claude/state/agents.json | \
  jq 'group_by(.status) | map({status: .[0].status, count: length})'
```

### Agent Output Files
```bash
ls -la /tmp/claude/*/tasks/*.output
```

## Troubleshooting

### Issue: Agents Not Running in Parallel

**Cause**: Spawning in separate messages

**Solution**: Use single message with multiple Task calls

### Issue: Agent Limit Exceeded

**Cause**: More than 7 agents spawned

**Solution**: Wait for agents to complete or adjust maxParallel

### Issue: Circular Dependencies

**Cause**: Sub-skill A depends on B, B depends on A

**Solution**: Validate composition with validateSkillComposition()

### Issue: Slow Execution

**Cause**: Using sequential mode instead of parallel

**Solution**: Change executionMode to "parallel" or "hybrid"

## Examples

### Example 1: PM Spawns 7 Developers
See: `skills/skyfom-pm-agent-orchestrator/workflows/parallel-spawning-guide.md`

### Example 2: Full-Stack Feature
See: `skills/skyfom-fullstack-developer/SKILL.md`

### Example 3: Feature-Complete Delivery
See: `skills/skyfom-feature-complete/SKILL.md`

## API Reference

### Types

```typescript
interface ParallelTaskSpec {
  subagent_type: string;
  description: string;
  prompt: string;
  model?: 'sonnet' | 'opus' | 'haiku';
  run_in_background?: boolean;
}

interface SkillComposition {
  name: string;
  description: string;
  subSkills: SubSkillDefinition[];
  executionMode: 'parallel' | 'sequential' | 'hybrid';
  maxParallel?: number;
}

interface SubSkillDefinition {
  skillName: string;
  role: string;
  dependencies?: string[];
  required: boolean;
  tokenEstimate?: number;
}
```

### Functions

- `generateParallelSpawnPrompt(tasks: ParallelTaskSpec[]): string`
- `validateSkillComposition(composition: SkillComposition): {valid: boolean, errors: string[]}`
- `planExecutionOrder(subSkills: SubSkillDefinition[]): SubSkillDefinition[][]`
- `generateParallelTaskSpecs(subSkills: SubSkillDefinition[], context: {...}): ParallelTaskSpec[]`
- `estimateCompositionTokens(composition: SkillComposition): number`

## Further Reading

- [PM Parallel Spawning Guide](../skills/skyfom-pm-agent-orchestrator/workflows/parallel-spawning-guide.md)
- [Parallel Executor Source](../orchestrator/parallel-executor.ts)
- [Composition Schema](../orchestrator/skill-composition-schema.json)
- [Full-Stack Developer Example](../skills/skyfom-fullstack-developer/SKILL.md)
- [Feature-Complete Example](../skills/skyfom-feature-complete/SKILL.md)
