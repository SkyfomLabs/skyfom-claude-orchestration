/**
 * Skyfom Orchestrator Type Definitions
 * Core types for multi-agent orchestration system
 */

export interface OrchestrationState {
  version: string;
  startedAt: string;
  phase: string;
  epicId?: string;
  status: 'idle' | 'running' | 'paused' | 'error';
  config: OrchestrationConfig;
  agents: AgentState[];
  tasks: TaskState[];
  metrics: OrchestrationMetrics;
}

export interface OrchestrationConfig {
  maxParallelAgents: number; // Max 7
  maxCodeReviewLoops: number; // Max 50
  maxTokensPerAgent: number; // Ideal 100k, max 200k
  tokenWarningThreshold: number; // 160k
  autoRestart: boolean; // Auto-restart on phase complete
  humanApprovalRequired: boolean; // Await approval between phases
}

export interface AgentState {
  id: string;
  agentType: string; // 'pm', 'frontend', 'backend', 'mobile', etc.
  skillName: string;
  status: 'spawning' | 'running' | 'waiting' | 'completed' | 'error';
  taskId?: string;
  assignedAt?: string;
  completedAt?: string;
  tokenUsage: number;
  error?: string;
  outputFile?: string;
}

export interface TaskState {
  id: string; // Beads task ID (bd-xxx)
  type: string;
  title: string;
  status: string; // Beads status
  assignee?: string; // Agent ID
  prNumber?: number;
  ciStatus?: 'pending' | 'running' | 'success' | 'failure';
  reviewLoops: number;
  tokenEstimate?: number;
}

export interface OrchestrationMetrics {
  totalAgentsSpawned: number;
  totalTasksCompleted: number;
  totalTokensUsed: number;
  averageReviewLoops: number;
  phaseStartedAt?: string;
  phaseCompletedAt?: string;
}

export interface PhaseDefinition {
  id: string;
  name: string;
  epicIds: string[];
  estimatedTokens: number;
  requiredSkills: string[];
}

export interface WorkflowEvent {
  type: 'task_assigned' | 'task_completed' | 'pr_created' | 'pr_merged' | 'ci_completed' | 'review_completed' | 'agent_spawned' | 'agent_completed' | 'error';
  timestamp: string;
  agentId?: string;
  taskId?: string;
  data: any;
}
