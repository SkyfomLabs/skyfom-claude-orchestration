/**
 * Rate Limiter for Skyfom Orchestrator
 * Handles API rate limiting with retry-every-minute logic
 */

import type { RateLimiterConfig } from './types';

export interface RateLimitState {
  totalAttempts: number;
  lastAttemptAt?: string;
  waitingForRetry: boolean;
  nextRetryAt?: string;
  retriesCount: number;
}

export class RateLimiter {
  private config: RateLimiterConfig;
  private state: RateLimitState;

  constructor(config: RateLimiterConfig) {
    this.config = config;
    this.state = {
      totalAttempts: 0,
      waitingForRetry: false,
      retriesCount: 0,
    };
  }

  /**
   * Check if operation can proceed or needs to wait
   * Returns { canProceed: boolean, waitSeconds?: number, message?: string }
   */
  checkRateLimit(): {
    canProceed: boolean;
    waitSeconds?: number;
    message?: string;
  } {
    if (!this.config.enabled) {
      return { canProceed: true };
    }

    // If not waiting for retry, can proceed
    if (!this.state.waitingForRetry) {
      this.state.totalAttempts++;
      this.state.lastAttemptAt = new Date().toISOString();
      return { canProceed: true };
    }

    // Calculate remaining wait time
    if (this.state.nextRetryAt) {
      const now = new Date();
      const nextRetry = new Date(this.state.nextRetryAt);
      const waitMs = nextRetry.getTime() - now.getTime();

      if (waitMs <= 0) {
        // Retry time reached
        this.state.waitingForRetry = false;
        this.state.retriesCount++;
        this.state.totalAttempts++;
        this.state.lastAttemptAt = new Date().toISOString();
        return {
          canProceed: true,
          message: `Retry ${this.state.retriesCount} after rate limit`,
        };
      }

      const waitSeconds = Math.ceil(waitMs / 1000);
      return {
        canProceed: false,
        waitSeconds,
        message: `Rate limited. Retrying in ${waitSeconds} seconds (${this.formatTime(waitSeconds)})`,
      };
    }

    return { canProceed: false };
  }

  /**
   * Trigger rate limit (called when API returns rate limit error)
   */
  triggerRateLimit(): void {
    this.state.waitingForRetry = true;
    const nextRetry = new Date();
    nextRetry.setSeconds(nextRetry.getSeconds() + this.config.retryDelaySeconds);
    this.state.nextRetryAt = nextRetry.toISOString();
  }

  /**
   * Check if max retries exceeded (if configured)
   * Returns true if should stop trying
   */
  shouldStopRetrying(): boolean {
    if (this.config.maxRetries === -1) {
      return false; // Infinite retries
    }

    return this.state.retriesCount >= this.config.maxRetries;
  }

  /**
   * Get current state for persistence
   */
  getState(): RateLimitState {
    return { ...this.state };
  }

  /**
   * Restore state from persistence
   */
  setState(state: RateLimitState): void {
    this.state = { ...state };
  }

  /**
   * Reset rate limiter state
   */
  reset(): void {
    this.state = {
      totalAttempts: 0,
      waitingForRetry: false,
      retriesCount: 0,
    };
  }

  /**
   * Format seconds to human-readable time
   */
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
      return remainingSeconds > 0
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  /**
   * Get countdown message for display
   */
  getCountdownMessage(): string | null {
    if (!this.state.waitingForRetry || !this.state.nextRetryAt) {
      return null;
    }

    const result = this.checkRateLimit();
    if (result.canProceed) {
      return null;
    }

    return result.message || null;
  }

  /**
   * Sleep utility for rate limit waiting
   * Returns promise that resolves when rate limit clears
   */
  async waitForRateLimit(): Promise<void> {
    while (true) {
      const result = this.checkRateLimit();

      if (result.canProceed) {
        return;
      }

      if (this.shouldStopRetrying()) {
        throw new Error(
          `Max retries (${this.config.maxRetries}) exceeded. Stopping.`
        );
      }

      if (result.message) {
        console.log(`⏳ ${result.message}`);
      }

      // Wait 1 second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  /**
   * Detect rate limit error from Claude API response
   * Returns true if rate limit detected
   */
  static isRateLimitError(error: any): boolean {
    if (!error) return false;

    const errorStr = JSON.stringify(error).toLowerCase();

    // Common rate limit patterns
    const patterns = [
      /rate limit/i,
      /too many requests/i,
      /quota exceeded/i,
      /429/,
      /usage limit/i,
      /plan limit/i,
    ];

    return patterns.some((pattern) => pattern.test(errorStr));
  }

  /**
   * Get retry statistics
   */
  getStats(): {
    totalAttempts: number;
    retriesCount: number;
    averageWaitTime: number;
  } {
    return {
      totalAttempts: this.state.totalAttempts,
      retriesCount: this.state.retriesCount,
      averageWaitTime:
        this.state.retriesCount > 0
          ? this.config.retryDelaySeconds
          : 0,
    };
  }
}

/**
 * Global rate limiter instance (shared across all agents)
 */
let globalRateLimiter: RateLimiter | null = null;

export function initializeGlobalRateLimiter(config: RateLimiterConfig): RateLimiter {
  globalRateLimiter = new RateLimiter(config);
  return globalRateLimiter;
}

export function getGlobalRateLimiter(): RateLimiter {
  if (!globalRateLimiter) {
    throw new Error('Rate limiter not initialized. Call initializeGlobalRateLimiter first.');
  }
  return globalRateLimiter;
}
