/**
 * Boot-time diagnostics helper to track bootstrap phases and failures.
 * Helps debug startup issues by recording timing and error context.
 */

interface BootPhase {
  phase: string;
  timestamp: number;
  success: boolean;
  error?: string;
}

class BootDiagnostics {
  private phases: BootPhase[] = [];
  private startTime: number = Date.now();

  recordPhase(phase: string, success: boolean, error?: Error | string) {
    this.phases.push({
      phase,
      timestamp: Date.now() - this.startTime,
      success,
      error: error instanceof Error ? error.message : error,
    });
  }

  getSnapshot() {
    return {
      phases: [...this.phases],
      totalTime: Date.now() - this.startTime,
    };
  }

  getSummary(): string {
    if (this.phases.length === 0) {
      return 'No boot phases recorded';
    }

    const lastPhase = this.phases[this.phases.length - 1];
    const failedPhases = this.phases.filter(p => !p.success);

    if (failedPhases.length > 0) {
      const lastFailure = failedPhases[failedPhases.length - 1];
      return `Failed at ${lastFailure.phase} (${lastFailure.timestamp}ms): ${lastFailure.error || 'Unknown error'}`;
    }

    return `Completed ${this.phases.length} phases in ${Date.now() - this.startTime}ms. Last: ${lastPhase.phase}`;
  }

  reset() {
    this.phases = [];
    this.startTime = Date.now();
  }
}

// Singleton instance
export const bootDiagnostics = new BootDiagnostics();
