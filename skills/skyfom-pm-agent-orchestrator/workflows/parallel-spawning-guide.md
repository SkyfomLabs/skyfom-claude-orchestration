# Parallel Agent Spawning Guide

This guide explains how to spawn multiple agents in true parallel using a single message with multiple Task tool calls.

## Core Principle

**CRITICAL**: To spawn agents in parallel, you MUST use a SINGLE message containing MULTIPLE Task tool invocations.

### Wrong Approach - Sequential Spawning
Sending separate messages for each agent results in sequential execution:
- Message 1: Spawn backend developer
- Message 2: Spawn frontend developer
- Message 3: Spawn mobile developer

Result: Agents start one after another (slow).

### Correct Approach - Parallel Spawning
Sending ONE message with MULTIPLE Task calls results in parallel execution:
- Single Message containing:
  - Task call 1: Backend developer
  - Task call 2: Frontend developer
  - Task call 3: Mobile developer

Result: All agents start simultaneously (fast).

## How to Implement Parallel Spawning

### Step 1: Identify Tasks to Parallelize

Determine which tasks can run independently:
- Backend API + Frontend UI + Mobile screens ✅ (can run in parallel)
- Database migration → Backend implementation ❌ (must be sequential)

### Step 2: Prepare Task Specifications

For each parallel task, prepare:
- subagent_type: Usually 'general-purpose'
- description: Brief 3-5 word description
- prompt: Full context including skill name, task details, requirements
- model: 'sonnet' for complex tasks, 'haiku' for simple tasks
- run_in_background: true (so agents run asynchronously)

### Step 3: Spawn All Agents in Single Message

In your response, explain what you're doing, then make ALL Task tool calls together.

Example explanation:
```
I'm spawning 3 developer agents IN PARALLEL to work on different parts
of this feature simultaneously. This allows all three to start at the
same time for maximum efficiency.

Agents:
1. Backend Developer - API implementation (Task ID: bd-123)
2. Frontend Developer - UI components (Task ID: bd-124)
3. Mobile Developer - Mobile screens (Task ID: bd-125)
```

Then make the tool calls. The key is to put them all in the SAME response.

### Step 4: Track Spawned Agents

After spawning, update state:
```bash
# Add agents to tracking file
cat >> .claude/state/agents.json <<EOF
{
  "id": "agent-001",
  "skillName": "skyfom-backend-developer",
  "taskId": "bd-123",
  "status": "running",
  "spawnedAt": "$(date -Iseconds)"
}
EOF
```

## Pattern: PM Orchestrator Spawning 7 Developers

When orchestrating multiple developers, the PM should:

1. Get ready tasks from Beads
2. Select up to 7 tasks that can run in parallel
3. Determine required skill for each task
4. Create task specifications for each
5. Spawn ALL agents in SINGLE message with up to 7 Task calls
6. Track each agent in state files
7. Monitor progress

### Example: PM Spawns 7 Developers

```
I have 7 ready tasks in Beads. I'm spawning 7 specialized developers
IN PARALLEL (one message, 7 Task calls) to maximize throughput:

1. Backend: Auth API (bd-101)
2. Frontend: Dashboard UI (bd-102)
3. Mobile: Profile screen (bd-103)
4. Backend: Payment service (bd-104)
5. DevOps: K8s deployment (bd-105)
6. Frontend: Settings page (bd-106)
7. Mobile: Notifications (bd-107)

All 7 agents will start simultaneously.
```

Then make 7 Task tool calls in the same response message.

## Using the Parallel Execution Framework

The orchestrator/parallel-executor.ts module provides utilities:

### Generate Parallel Spawn Prompt
```typescript
import { generateParallelSpawnPrompt } from './orchestrator/parallel-executor';

const tasks = [
  { subagent_type: 'general-purpose', description: 'Backend API', prompt: '...' },
  { subagent_type: 'general-purpose', description: 'Frontend UI', prompt: '...' },
  { subagent_type: 'general-purpose', description: 'Mobile screens', prompt: '...' }
];

const prompt = generateParallelSpawnPrompt(tasks);
// Returns instructions for parallel spawning
```

### Plan Execution Order with Dependencies
```typescript
import { planExecutionOrder } from './orchestrator/parallel-executor';

const subSkills = [
  { skillName: 'backend', role: 'API', dependencies: [], required: true },
  { skillName: 'frontend', role: 'UI', dependencies: ['backend'], required: true },
  { skillName: 'mobile', role: 'App', dependencies: ['backend'], required: false }
];

const groups = planExecutionOrder(subSkills);
// Returns: [
//   [backend],           // Group 1: No dependencies, run first
//   [frontend, mobile]   // Group 2: Depend on backend, run in parallel after
// ]
```

### Generate Task Specs for Parallel Execution
```typescript
import { generateParallelTaskSpecs } from './orchestrator/parallel-executor';

const specs = generateParallelTaskSpecs(
  subSkills,
  {
    taskId: 'bd-123',
    epicId: 'bd-epic-456',
    requirements: 'Implement user authentication',
    sharedContext: { apiVersion: 'v2' }
  }
);
// Returns array of ParallelTaskSpec objects ready to spawn
```

## Composite Skills and Parallel Execution

Composite skills (like skyfom-fullstack-developer) use this pattern automatically:

1. Load composition.json
2. Plan execution groups based on dependencies
3. For each group, generate parallel task specs
4. Spawn all tasks in group with single message
5. Wait for group completion
6. Move to next group

See:
- skills/skyfom-fullstack-developer/composition.json
- skills/skyfom-feature-complete/composition.json

## Verification

After spawning agents in parallel, verify they're all running:

```bash
# Check agent status
cat .claude/state/agents.json | jq '.[] | select(.status == "running")'

# Monitor events
tail -f .claude/state/events.jsonl

# Check agent outputs
ls -la /tmp/claude/*/tasks/*.output
```

## Common Mistakes

### Mistake 1: Sending Separate Messages
```
Message 1: "Spawning backend developer..."
  [Task call for backend]
Message 2: "Spawning frontend developer..."
  [Task call for frontend]
```
Result: Sequential execution ❌

### Mistake 2: Using a Loop
```
for task in tasks:
  spawn_agent(task)  # Each spawns in separate message
```
Result: Sequential execution ❌

### Mistake 3: Not Using run_in_background
```
Task call 1: run_in_background = false
Task call 2: run_in_background = false
```
Result: First agent blocks, second waits ❌

### Correct Pattern
```
Single message:
  "Spawning 3 agents in parallel..."
  [Task call 1: run_in_background = true]
  [Task call 2: run_in_background = true]
  [Task call 3: run_in_background = true]
```
Result: All agents start simultaneously ✅

## Performance Impact

Sequential spawning (wrong):
- Agent 1 starts at T+0s
- Agent 2 starts at T+60s (after message delay)
- Agent 3 starts at T+120s
- Total time: Individual times + 120s overhead

Parallel spawning (correct):
- Agent 1 starts at T+0s
- Agent 2 starts at T+0s
- Agent 3 starts at T+0s
- Total time: Max(individual times)

For 7 agents working 30 minutes each:
- Sequential: ~3.5 hours
- Parallel: ~30 minutes

**Performance improvement: 7x faster** ⚡
