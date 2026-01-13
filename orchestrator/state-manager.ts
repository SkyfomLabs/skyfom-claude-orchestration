/**
 * State Manager for Skyfom Orchestrator
 * Manages orchestration state in JSON files
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { OrchestrationState, AgentState, TaskState, WorkflowEvent } from './types';

const STATE_DIR = join(process.cwd(), '.claude', 'state');
const STATE_FILE = join(STATE_DIR, 'orchestration.json');
const EVENTS_FILE = join(STATE_DIR, 'events.jsonl');
const AGENTS_FILE = join(STATE_DIR, 'agents.json');
const TASKS_FILE = join(STATE_DIR, 'tasks.json');

export class StateManager {
  private state: OrchestrationState | null = null;

  async initialize(): Promise<void> {
    // Ensure state directory exists
    if (!existsSync(STATE_DIR)) {
      await mkdir(STATE_DIR, { recursive: true });
    }

    // Load or create initial state
    if (existsSync(STATE_FILE)) {
      await this.load();
    } else {
      await this.createInitialState();
    }
  }

  private async createInitialState(): Promise<void> {
    this.state = {
      version: '1.1.0',
      startedAt: new Date().toISOString(),
      phase: 'idle',
      status: 'idle',
      config: {
        maxParallelAgents: 7,
        maxCodeReviewLoops: 50,
        maxTokensPerAgent: 200000,
        tokenWarningThreshold: 160000,
        autoRestart: false,
        humanApprovalRequired: true,
        autonomousMode: true,
        circuitBreaker: {
          maxNoProgressLoops: 5,
          maxRepeatedErrorLoops: 10,
          enabled: true,
        },
        rateLimiter: {
          enabled: true,
          retryDelaySeconds: 60,
          maxRetries: -1,
        },
      },
      agents: [],
      tasks: [],
      metrics: {
        totalAgentsSpawned: 0,
        totalTasksCompleted: 0,
        totalTokensUsed: 0,
        averageReviewLoops: 0,
        totalLoops: 0,
        circuitBreakerTrips: 0,
        rateLimitHits: 0,
        averageLoopsPerTask: 0,
      },
    };

    await this.save();
  }

  async load(): Promise<OrchestrationState> {
    try {
      const content = await readFile(STATE_FILE, 'utf-8');
      this.state = JSON.parse(content);
      return this.state!;
    } catch (error) {
      console.error('Failed to load state:', error);
      await this.createInitialState();
      return this.state!;
    }
  }

  async save(): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    try {
      await writeFile(STATE_FILE, JSON.stringify(this.state, null, 2));

      // Also save agents and tasks separately for easier access
      await writeFile(AGENTS_FILE, JSON.stringify(this.state.agents, null, 2));
      await writeFile(TASKS_FILE, JSON.stringify(this.state.tasks, null, 2));
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  }

  getState(): OrchestrationState {
    if (!this.state) {
      throw new Error('State not initialized');
    }
    return this.state;
  }

  async updateState(updates: Partial<OrchestrationState>): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    this.state = { ...this.state, ...updates };
    await this.save();
  }

  async addAgent(agent: AgentState): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    this.state.agents.push(agent);
    this.state.metrics.totalAgentsSpawned++;
    await this.save();
  }

  async updateAgent(agentId: string, updates: Partial<AgentState>): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    const index = this.state.agents.findIndex(a => a.id === agentId);
    if (index === -1) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.state.agents[index] = { ...this.state.agents[index], ...updates };
    await this.save();
  }

  async addTask(task: TaskState): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    this.state.tasks.push(task);
    await this.save();
  }

  async updateTask(taskId: string, updates: Partial<TaskState>): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    const index = this.state.tasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      throw new Error(`Task ${taskId} not found`);
    }

    this.state.tasks[index] = { ...this.state.tasks[index], ...updates };

    // Update metrics if task completed
    if (updates.status === 'closed' && this.state.tasks[index].status !== 'closed') {
      this.state.metrics.totalTasksCompleted++;

      // Update average review loops
      const completedTasks = this.state.tasks.filter(t => t.status === 'closed');
      const totalLoops = completedTasks.reduce((sum, t) => sum + t.reviewLoops, 0);
      this.state.metrics.averageReviewLoops = totalLoops / completedTasks.length;
    }

    await this.save();
  }

  async logEvent(event: WorkflowEvent): Promise<void> {
    try {
      const eventLine = JSON.stringify(event) + '\n';
      await writeFile(EVENTS_FILE, eventLine, { flag: 'a' });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  async getActiveAgents(): Promise<AgentState[]> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    return this.state.agents.filter(a =>
      a.status === 'running' || a.status === 'waiting' || a.status === 'spawning'
    );
  }

  async getAvailableAgentSlots(): Promise<number> {
    const activeAgents = await this.getActiveAgents();
    return this.state!.config.maxParallelAgents - activeAgents.length;
  }

  async updateTokenUsage(agentId: string, tokensUsed: number): Promise<void> {
    await this.updateAgent(agentId, { tokenUsage: tokensUsed });

    if (!this.state) return;

    this.state.metrics.totalTokensUsed += tokensUsed;
    await this.save();
  }

  async reset(): Promise<void> {
    await this.createInitialState();
  }

  /**
   * Update agent loop state
   */
  async updateAgentLoopState(
    agentId: string,
    loopState: Partial<import('./types').AgentLoopState>
  ): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    const agent = this.state.agents.find((a) => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.loopState = {
      ...agent.loopState,
      ...loopState,
    } as import('./types').AgentLoopState;

    await this.save();
  }

  /**
   * Increment loop metrics
   */
  async incrementLoopMetrics(
    loops: number = 1,
    circuitBreakerTrip: boolean = false
  ): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    this.state.metrics.totalLoops += loops;

    if (circuitBreakerTrip) {
      this.state.metrics.circuitBreakerTrips++;
    }

    // Update average loops per task
    if (this.state.metrics.totalTasksCompleted > 0) {
      this.state.metrics.averageLoopsPerTask =
        this.state.metrics.totalLoops / this.state.metrics.totalTasksCompleted;
    }

    await this.save();
  }

  /**
   * Increment rate limit hits
   */
  async incrementRateLimitHits(): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    this.state.metrics.rateLimitHits++;
    await this.save();
  }

  /**
   * Get agents with open circuit breaker
   */
  async getCircuitOpenAgents(): Promise<import('./types').AgentState[]> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    return this.state.agents.filter(
      (a) => a.loopState?.circuitState === 'open'
    );
  }

  /**
   * Check if autonomous mode is enabled
   */
  isAutonomousMode(): boolean {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    return this.state.config.autonomousMode ?? true;
  }
}

// Export singleton instance
export const stateManager = new StateManager();
