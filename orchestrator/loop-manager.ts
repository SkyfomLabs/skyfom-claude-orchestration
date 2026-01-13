/**
 * Loop Manager for Skyfom Orchestrator
 * Implements autonomous loop control with circuit breaker and exit detection
 * Inspired by Ralph's dual-condition gate pattern
 */

import type {
  AgentLoopState,
  CircuitBreakerConfig,
  LoopExitCondition,
} from './types';
import crypto from 'crypto';

/**
 * Completion indicator patterns (semantic analysis)
 * Inspired by Ralph's EXIT_SIGNAL dual-gate pattern
 */
const COMPLETION_PATTERNS = [
  /task\s+(is\s+)?complete/i,
  /implementation\s+(is\s+)?finished/i,
  /all\s+done/i,
  /successfully\s+(completed|merged)/i,
  /pr\s+(has\s+been\s+)?merged/i,
  /no\s+(more|further)\s+(work|changes|tasks)/i,
  /ready\s+for\s+(review|merge|deployment)/i,
  /epic\s+(is\s+)?complete/i,
  /phase\s+(is\s+)?complete/i,
  /\bDONE\b/,
];

/**
 * Error patterns for detection
 */
const ERROR_PATTERNS = [
  /error:/i,
  /failed:/i,
  /exception:/i,
  /cannot\s+\w+/i,
  /unable\s+to\s+\w+/i,
  /not\s+found/i,
  /permission\s+denied/i,
  /fatal:/i,
];

export class LoopManager {
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Initialize loop state for a new agent
   */
  initializeLoopState(): AgentLoopState {
    return {
      currentLoop: 0,
      noProgressLoops: 0,
      repeatedErrorLoops: 0,
      circuitState: 'closed',
      exitSignal: false,
      completionIndicators: [],
    };
  }

  /**
   * Analyze agent output for completion indicators and exit signal
   * Implements Ralph's dual-condition gate pattern:
   * - Must have >= 2 completion indicators
   * - Must have explicit EXIT_SIGNAL
   */
  analyzeExitCondition(
    output: string,
    loopState: AgentLoopState
  ): LoopExitCondition {
    // Check for explicit EXIT_SIGNAL
    const exitSignal = /EXIT_SIGNAL:\s*true/i.test(output);

    // Detect completion indicators
    const detectedIndicators: string[] = [];
    for (const pattern of COMPLETION_PATTERNS) {
      const match = output.match(pattern);
      if (match) {
        detectedIndicators.push(match[0]);
      }
    }

    const completionCount = detectedIndicators.length;
    const shouldExit = exitSignal && completionCount >= 2;

    let reason = '';
    if (shouldExit) {
      reason = `Exit conditions met: EXIT_SIGNAL=${exitSignal}, completion indicators=${completionCount} (${detectedIndicators.join(', ')})`;
    } else if (!exitSignal) {
      reason = `EXIT_SIGNAL not set (found ${completionCount} completion indicators)`;
    } else {
      reason = `Need >= 2 completion indicators (found ${completionCount})`;
    }

    return {
      exitSignal,
      completionIndicators: completionCount,
      shouldExit,
      reason,
    };
  }

  /**
   * Detect progress by comparing output hash
   * Returns true if progress detected, false otherwise
   */
  detectProgress(output: string, lastProgress?: string): boolean {
    // Create hash of meaningful output (exclude timestamps, ids)
    const normalized = output
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '') // timestamps
      .replace(/\b[0-9a-f]{8,}\b/gi, '') // hex ids
      .replace(/\s+/g, ' ') // normalize whitespace
      .trim();

    const currentHash = crypto
      .createHash('sha256')
      .update(normalized)
      .digest('hex')
      .substring(0, 16);

    if (!lastProgress) {
      return true; // First loop always has progress
    }

    // Progress detected if hash is different
    return currentHash !== lastProgress;
  }

  /**
   * Detect repeated errors by comparing error messages
   */
  detectRepeatedError(output: string, lastError?: string): string | null {
    const errors: string[] = [];

    for (const pattern of ERROR_PATTERNS) {
      const match = output.match(pattern);
      if (match) {
        errors.push(match[0]);
      }
    }

    if (errors.length === 0) {
      return null; // No error detected
    }

    const currentError = errors.join('|');

    // Check if same as last error
    if (lastError && currentError === lastError) {
      return currentError; // Repeated error
    }

    return currentError; // New error (not repeated)
  }

  /**
   * Update loop state after iteration
   * Returns updated state and circuit breaker decision
   */
  updateLoopState(
    loopState: AgentLoopState,
    output: string
  ): {
    loopState: AgentLoopState;
    shouldContinue: boolean;
    reason: string;
  } {
    const newState = { ...loopState };
    newState.currentLoop++;

    // Check progress
    const hasProgress = this.detectProgress(output, loopState.lastProgress);
    if (hasProgress) {
      newState.noProgressLoops = 0;
      newState.lastProgress = crypto
        .createHash('sha256')
        .update(output)
        .digest('hex')
        .substring(0, 16);
    } else {
      newState.noProgressLoops++;
    }

    // Check errors
    const error = this.detectRepeatedError(output, loopState.lastError);
    if (error) {
      if (error === loopState.lastError) {
        newState.repeatedErrorLoops++;
      } else {
        newState.repeatedErrorLoops = 1;
        newState.lastError = error;
      }
    } else {
      newState.repeatedErrorLoops = 0;
      newState.lastError = undefined;
    }

    // Check circuit breaker conditions
    if (!this.config.enabled) {
      return {
        loopState: newState,
        shouldContinue: true,
        reason: 'Circuit breaker disabled',
      };
    }

    // No progress circuit breaker
    if (newState.noProgressLoops >= this.config.maxNoProgressLoops) {
      newState.circuitState = 'open';
      return {
        loopState: newState,
        shouldContinue: false,
        reason: `Circuit breaker OPEN: ${newState.noProgressLoops} consecutive loops with no progress (max ${this.config.maxNoProgressLoops})`,
      };
    }

    // Repeated error circuit breaker
    if (newState.repeatedErrorLoops >= this.config.maxRepeatedErrorLoops) {
      newState.circuitState = 'open';
      return {
        loopState: newState,
        shouldContinue: false,
        reason: `Circuit breaker OPEN: ${newState.repeatedErrorLoops} consecutive loops with repeated error "${newState.lastError}" (max ${this.config.maxRepeatedErrorLoops})`,
      };
    }

    // Check exit condition
    const exitCondition = this.analyzeExitCondition(output, newState);
    newState.exitSignal = exitCondition.exitSignal;
    newState.completionIndicators = [];

    if (exitCondition.shouldExit) {
      return {
        loopState: newState,
        shouldContinue: false,
        reason: exitCondition.reason || 'Exit signal detected',
      };
    }

    // Circuit remains closed, continue
    newState.circuitState = 'closed';
    return {
      loopState: newState,
      shouldContinue: true,
      reason: hasProgress
        ? 'Progress detected, continuing'
        : `No progress (${newState.noProgressLoops}/${this.config.maxNoProgressLoops}), continuing`,
    };
  }

  /**
   * Check if agent should exit loop based on exit condition
   */
  shouldExitLoop(exitCondition: LoopExitCondition): boolean {
    return exitCondition.shouldExit;
  }

  /**
   * Reset circuit breaker (for manual recovery)
   */
  resetCircuit(loopState: AgentLoopState): AgentLoopState {
    return {
      ...loopState,
      circuitState: 'closed',
      noProgressLoops: 0,
      repeatedErrorLoops: 0,
    };
  }
}

/**
 * Helper to create loop iteration summary for logging
 */
export function createLoopSummary(
  agentId: string,
  loopState: AgentLoopState,
  exitCondition: LoopExitCondition
): string {
  return [
    `Agent ${agentId} - Loop ${loopState.currentLoop}`,
    `Circuit: ${loopState.circuitState}`,
    `No Progress: ${loopState.noProgressLoops}`,
    `Repeated Errors: ${loopState.repeatedErrorLoops}`,
    `Exit Signal: ${exitCondition.exitSignal}`,
    `Completion Indicators: ${exitCondition.completionIndicators}`,
    `Should Exit: ${exitCondition.shouldExit}`,
    `Reason: ${exitCondition.reason}`,
  ].join(' | ');
}
