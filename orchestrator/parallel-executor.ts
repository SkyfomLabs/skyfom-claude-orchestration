/**
 * Parallel Execution Framework for Skyfom Orchestration
 * Enables skills to spawn multiple sub-agents in parallel
 */

export interface ParallelTaskSpec {
  subagent_type: string;
  description: string;
  prompt: string;
  model?: 'sonnet' | 'opus' | 'haiku';
  run_in_background?: boolean;
}

export interface SkillComposition {
  name: string;
  description: string;
  subSkills: SubSkillDefinition[];
  executionMode: 'parallel' | 'sequential' | 'hybrid';
  maxParallel?: number; // Max concurrent sub-skills (default: 7)
}

export interface SubSkillDefinition {
  skillName: string; // Name of the sub-skill to invoke
  role: string; // Role description for this sub-skill
  dependencies?: string[]; // Other sub-skill names this depends on
  required: boolean; // Whether this sub-skill must complete successfully
  tokenEstimate?: number; // Estimated token usage
}

export interface ParallelExecutionResult {
  taskId: string;
  status: 'completed' | 'failed' | 'timeout';
  output?: string;
  error?: string;
  tokenUsage: number;
}

/**
 * Generates a parallel execution prompt for spawning multiple agents
 * This ensures all agents are spawned in a single message with multiple Task calls
 */
export function generateParallelSpawnPrompt(tasks: ParallelTaskSpec[]): string {
  const taskDescriptions = tasks.map((task, idx) =>
    `${idx + 1}. ${task.description} (${task.subagent_type})`
  ).join('\n');

  return `
CRITICAL: You must spawn ${tasks.length} agents IN PARALLEL using a SINGLE message with ${tasks.length} Task tool calls.

Tasks to spawn:
${taskDescriptions}

REQUIREMENTS:
1. Send ONE message containing ALL ${tasks.length} Task tool invocations
2. Do NOT send separate messages for each agent
3. Do NOT spawn agents sequentially
4. Use the Task tool ${tasks.length} times in the same response

This enables true parallel execution where all agents start simultaneously.
`.trim();
}

/**
 * Validates that a skill composition is properly configured
 */
export function validateSkillComposition(composition: SkillComposition): {
  valid: boolean;
  errors: string[]
} {
  const errors: string[] = [];

  // Check for circular dependencies
  const dependencyGraph = new Map<string, string[]>();
  composition.subSkills.forEach(skill => {
    dependencyGraph.set(skill.skillName, skill.dependencies || []);
  });

  // Simple cycle detection
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(skillName: string): boolean {
    visited.add(skillName);
    recursionStack.add(skillName);

    const deps = dependencyGraph.get(skillName) || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        if (hasCycle(dep)) return true;
      } else if (recursionStack.has(dep)) {
        return true;
      }
    }

    recursionStack.delete(skillName);
    return false;
  }

  for (const skill of composition.subSkills) {
    visited.clear();
    recursionStack.clear();
    if (hasCycle(skill.skillName)) {
      errors.push(`Circular dependency detected involving ${skill.skillName}`);
    }
  }

  // Check max parallel
  if (composition.maxParallel && composition.maxParallel > 7) {
    errors.push('maxParallel cannot exceed 7 (system limit)');
  }

  // Check execution mode
  if (composition.executionMode === 'parallel' && composition.subSkills.length > 7) {
    errors.push(`Parallel execution with ${composition.subSkills.length} sub-skills exceeds limit of 7`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Determines execution order based on dependencies
 * Returns groups of skills that can be executed in parallel
 */
export function planExecutionOrder(subSkills: SubSkillDefinition[]): SubSkillDefinition[][] {
  const skillMap = new Map(subSkills.map(s => [s.skillName, s]));
  const completed = new Set<string>();
  const executionGroups: SubSkillDefinition[][] = [];

  while (completed.size < subSkills.length) {
    const readySkills = subSkills.filter(skill => {
      if (completed.has(skill.skillName)) return false;
      const deps = skill.dependencies || [];
      return deps.every(dep => completed.has(dep));
    });

    if (readySkills.length === 0) {
      throw new Error('Deadlock detected: no skills are ready to execute');
    }

    executionGroups.push(readySkills);
    readySkills.forEach(skill => completed.add(skill.skillName));
  }

  return executionGroups;
}

/**
 * Generates task specs for a group of sub-skills to be spawned in parallel
 */
export function generateParallelTaskSpecs(
  subSkills: SubSkillDefinition[],
  context: {
    epicId?: string;
    taskId?: string;
    requirements: string;
    sharedContext?: Record<string, any>;
  }
): ParallelTaskSpec[] {
  return subSkills.map(subSkill => ({
    subagent_type: 'general-purpose', // All sub-skills use general-purpose agent
    description: `Execute ${subSkill.skillName}: ${subSkill.role}`,
    prompt: `
You are now acting as the ${subSkill.skillName} skill.

## Your Role
${subSkill.role}

## Context
${context.taskId ? `Task ID: ${context.taskId}` : ''}
${context.epicId ? `Epic ID: ${context.epicId}` : ''}

## Requirements
${context.requirements}

## Shared Context
${context.sharedContext ? JSON.stringify(context.sharedContext, null, 2) : 'None'}

## Instructions
Follow the skill guidelines in .claude/skills/${subSkill.skillName}/SKILL.md

Complete your assigned portion of the work and report back with:
1. What you implemented
2. Files created/modified
3. Tests added
4. Any blockers or dependencies for other sub-skills
5. Token usage estimate

${subSkill.required ? '⚠️ This is a REQUIRED sub-skill. Failure is not acceptable.' : ''}
`.trim(),
    model: 'sonnet',
    run_in_background: true
  }));
}

/**
 * Calculates estimated total tokens for a skill composition
 */
export function estimateCompositionTokens(composition: SkillComposition): number {
  return composition.subSkills.reduce((total, skill) =>
    total + (skill.tokenEstimate || 50000), // Default 50k per sub-skill
    0
  );
}
