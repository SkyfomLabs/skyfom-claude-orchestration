# Skyfom Orchestrator - Parallel Execution Framework

This directory contains the core parallel execution framework for Skyfom Orchestration.

## Files

### parallel-executor.ts
Core utilities for spawning and managing multiple agents in parallel.

**Key Functions**:
- `generateParallelSpawnPrompt()` - Creates instructions for parallel agent spawning
- `validateSkillComposition()` - Validates composite skill definitions
- `planExecutionOrder()` - Resolves dependencies and creates execution groups
- `generateParallelTaskSpecs()` - Generates Task specs for parallel execution
- `estimateCompositionTokens()` - Calculates token estimates for compositions

### skill-composition-schema.json
JSON Schema for validating composite skill definitions.

Validates composition files to ensure:
- Correct structure
- No circular dependencies
- Valid execution modes
- Proper dependency declarations

### state-manager.ts
State management utilities for tracking orchestration progress.

### types.ts
TypeScript type definitions for:
- `OrchestrationState`
- `AgentState`
- `TaskState`
- `SkillComposition`
- `SubSkillDefinition`
- `ParallelTaskSpec`

## Usage

### 1. Create a Composite Skill

Define a `composition.json`:

```json
{
  "name": "skyfom-my-composite-skill",
  "description": "Description of composite skill",
  "version": "1.0.0",
  "executionMode": "hybrid",
  "maxParallel": 3,
  "subSkills": [
    {
      "skillName": "skyfom-backend-developer",
      "role": "Implement backend API",
      "dependencies": [],
      "required": true,
      "tokenEstimate": 50000
    },
    {
      "skillName": "skyfom-frontend-developer",
      "role": "Implement frontend UI",
      "dependencies": ["skyfom-backend-developer"],
      "required": true,
      "tokenEstimate": 45000
    }
  ],
  "coordinationStrategy": {
    "errorHandling": "fail-fast",
    "maxRetries": 1,
    "timeout": 7200
  }
}
```

### 2. Validate the Composition

```typescript
import { validateSkillComposition } from './parallel-executor';

const composition = require('./skills/my-skill/composition.json');
const { valid, errors } = validateSkillComposition(composition);

if (!valid) {
  console.error('Invalid composition:', errors);
  process.exit(1);
}
```

### 3. Plan Execution Order

```typescript
import { planExecutionOrder } from './parallel-executor';

const executionGroups = planExecutionOrder(composition.subSkills);

// executionGroups = [
//   [backend],           // Group 1: No dependencies
//   [frontend, mobile]   // Group 2: Parallel after backend
// ]
```

### 4. Generate Task Specs

```typescript
import { generateParallelTaskSpecs } from './parallel-executor';

for (const group of executionGroups) {
  const taskSpecs = generateParallelTaskSpecs(group, {
    taskId: 'bd-123',
    epicId: 'bd-epic-456',
    requirements: 'Feature description',
    sharedContext: { apiVersion: 'v2' }
  });

  // Spawn all tasks in group using Task tool
  // Make ALL calls in SINGLE message for parallel execution
}
```

### 5. Spawn Agents in Parallel

**CRITICAL**: Use a SINGLE message with MULTIPLE Task tool calls.

```markdown
Spawning {group.length} agents in parallel (one message, {group.length} Task calls):

1. Agent 1 description
2. Agent 2 description
3. Agent 3 description
```

Then make all Task tool invocations in the same response.

## Execution Modes

### Parallel
All sub-skills execute simultaneously (no dependencies).

```json
{
  "executionMode": "parallel",
  "subSkills": [
    { "skillName": "backend", "dependencies": [] },
    { "skillName": "frontend", "dependencies": [] },
    { "skillName": "mobile", "dependencies": [] }
  ]
}
```

### Sequential
Sub-skills execute one after another.

```json
{
  "executionMode": "sequential",
  "subSkills": [
    { "skillName": "design", "dependencies": [] },
    { "skillName": "development", "dependencies": ["design"] },
    { "skillName": "testing", "dependencies": ["development"] }
  ]
}
```

### Hybrid
Respects dependencies, parallelizes when possible (recommended).

```json
{
  "executionMode": "hybrid",
  "subSkills": [
    { "skillName": "backend", "dependencies": [] },
    { "skillName": "frontend", "dependencies": ["backend"] },
    { "skillName": "mobile", "dependencies": ["backend"] }
  ]
}
```

Execution:
1. Group 1: backend (solo)
2. Group 2: frontend + mobile (parallel)

## Error Handling Strategies

### fail-fast (default)
Abort on first error.

```json
{
  "coordinationStrategy": {
    "errorHandling": "fail-fast"
  }
}
```

### continue-on-error
Complete all sub-skills, report failures at end.

```json
{
  "coordinationStrategy": {
    "errorHandling": "continue-on-error"
  }
}
```

### retry
Retry failed sub-skills up to maxRetries.

```json
{
  "coordinationStrategy": {
    "errorHandling": "retry",
    "maxRetries": 2
  }
}
```

## Examples

### Example 1: Full-Stack Developer

See: `skills/skyfom-fullstack-developer/`

Combines:
- Backend developer
- Frontend developer
- Mobile developer (optional)

Mode: Hybrid (backend first, then frontend + mobile in parallel)

### Example 2: Feature-Complete Developer

See: `skills/skyfom-feature-complete/`

Combines:
- Backend developer
- Frontend developer
- Designer (optional)
- QA engineer
- Code reviewer

Mode: Hybrid (development + design in parallel, then QA + review in parallel)

## Performance

### Sequential vs Parallel

3 agents, 30 minutes each:

**Sequential**: 90 minutes (30 + 30 + 30)
**Parallel**: 30 minutes (max of all)

**Speedup**: 3x

7 agents, 30 minutes each:

**Sequential**: 210 minutes (7 * 30)
**Parallel**: 30 minutes

**Speedup**: 7x

## Best Practices

1. **Use Hybrid Mode**: Best balance of parallelism and correctness
2. **Set run_in_background**: Always use for parallel tasks
3. **Declare Dependencies**: Be explicit about dependencies
4. **Estimate Tokens**: Provide realistic estimates
5. **Track Everything**: Update state files after spawning
6. **Single Message Rule**: Always spawn parallel agents in one message

## Troubleshooting

### Issue: Circular Dependency
**Error**: "Circular dependency detected"
**Fix**: Remove circular reference in composition.json

### Issue: Agents Not Parallel
**Cause**: Spawning in separate messages
**Fix**: Use single message with multiple Task calls

### Issue: Agent Limit Exceeded
**Cause**: More than 7 total agents
**Fix**: Reduce maxParallel or wait for completions

## Further Reading

- [Parallel Execution Guide](../docs/PARALLEL-EXECUTION.md)
- [PM Spawning Guide](../skills/skyfom-pm-agent-orchestrator/workflows/parallel-spawning-guide.md)
- [Full-Stack Example](../skills/skyfom-fullstack-developer/SKILL.md)
- [Feature-Complete Example](../skills/skyfom-feature-complete/SKILL.md)
