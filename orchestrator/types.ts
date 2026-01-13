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
  // Loop control (inspired by Ralph)
  circuitBreaker: CircuitBreakerConfig;
  rateLimiter: RateLimiterConfig;
  autonomousMode: boolean; // Default true, set false with --manual flag
}

export interface CircuitBreakerConfig {
  maxNoProgressLoops: number; // Default 5
  maxRepeatedErrorLoops: number; // Default 10
  enabled: boolean; // Default true
}

export interface RateLimiterConfig {
  enabled: boolean; // Default true
  retryDelaySeconds: number; // Default 60 (retry every minute)
  maxRetries: number; // Default -1 (infinite retries)
}

export interface AgentState {
  id: string;
  agentType: string; // 'pm', 'frontend', 'backend', 'mobile', etc.
  skillName: string;
  status: 'spawning' | 'running' | 'waiting' | 'completed' | 'error' | 'circuit_open';
  taskId?: string;
  assignedAt?: string;
  completedAt?: string;
  tokenUsage: number;
  error?: string;
  outputFile?: string;
  loopState?: AgentLoopState;
}

export interface AgentLoopState {
  currentLoop: number;
  noProgressLoops: number; // Consecutive loops with no progress
  repeatedErrorLoops: number; // Consecutive loops with same error
  lastProgress?: string; // Hash or summary of last progress
  lastError?: string; // Last error message
  circuitState: 'closed' | 'open' | 'half_open';
  exitSignal: boolean; // Explicit exit signal from agent
  completionIndicators: string[]; // Detected completion patterns
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
  // Loop metrics
  totalLoops: number;
  circuitBreakerTrips: number;
  rateLimitHits: number;
  averageLoopsPerTask: number;
}

export interface PhaseDefinition {
  id: string;
  name: string;
  epicIds: string[];
  estimatedTokens: number;
  requiredSkills: string[];
}

export interface WorkflowEvent {
  type: 'task_assigned' | 'task_completed' | 'pr_created' | 'pr_merged' | 'ci_completed' | 'review_completed' | 'agent_spawned' | 'agent_completed' | 'error' | 'loop_iteration' | 'circuit_breaker_open' | 'circuit_breaker_closed' | 'rate_limit_hit' | 'exit_signal_detected' | 'progress_detected' | 'no_progress_detected';
  timestamp: string;
  agentId?: string;
  taskId?: string;
  data: any;
}

export interface LoopExitCondition {
  exitSignal: boolean; // Explicit EXIT_SIGNAL from agent
  completionIndicators: number; // Number of detected completion patterns (need >= 2)
  shouldExit: boolean; // Combined condition: exitSignal && completionIndicators >= 2
  reason?: string; // Why loop should continue or exit
}
