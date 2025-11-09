/**
 * AI Timeout Watchdog
 * Priority: 1 (No dependencies)
 * Monitors and enforces timeouts for AI operations
 */

export interface WatchdogConfig {
  timeoutMs: number
  onTimeout?: (operationId: string) => void
  onComplete?: (operationId: string, duration: number) => void
}

export interface WatchdogOperation {
  id: string
  startTime: number
  timeoutMs: number
  timer: NodeJS.Timeout
  status: "running" | "completed" | "timeout" | "cancelled"
}

export class AITimeoutWatchdog {
  private static readonly DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.AI_TIMEOUT_MS || "30000")
  private operations: Map<string, WatchdogOperation> = new Map()

  /**
   * Starts monitoring an AI operation
   */
  startOperation(operationId: string, config?: Partial<WatchdogConfig>): void {
    const timeoutMs = config?.timeoutMs || AITimeoutWatchdog.DEFAULT_TIMEOUT_MS

    // Cancel existing operation with same ID
    if (this.operations.has(operationId)) {
      this.cancelOperation(operationId)
    }

    const timer = setTimeout(() => {
      this.handleTimeout(operationId, config?.onTimeout)
    }, timeoutMs)

    const operation: WatchdogOperation = {
      id: operationId,
      startTime: Date.now(),
      timeoutMs,
      timer,
      status: "running",
    }

    this.operations.set(operationId, operation)
  }

  /**
   * Completes an operation successfully
   */
  completeOperation(operationId: string, onComplete?: (operationId: string, duration: number) => void): void {
    const operation = this.operations.get(operationId)

    if (!operation) {
      return
    }

    clearTimeout(operation.timer)
    operation.status = "completed"

    const duration = Date.now() - operation.startTime

    if (onComplete) {
      onComplete(operationId, duration)
    }

    this.operations.delete(operationId)
  }

  /**
   * Cancels an operation
   */
  cancelOperation(operationId: string): void {
    const operation = this.operations.get(operationId)

    if (!operation) {
      return
    }

    clearTimeout(operation.timer)
    operation.status = "cancelled"
    this.operations.delete(operationId)
  }

  /**
   * Handles timeout
   */
  private handleTimeout(operationId: string, onTimeout?: (operationId: string) => void): void {
    const operation = this.operations.get(operationId)

    if (!operation) {
      return
    }

    operation.status = "timeout"

    if (onTimeout) {
      onTimeout(operationId)
    }

    this.operations.delete(operationId)
  }

  /**
   * Gets operation status
   */
  getOperationStatus(operationId: string): WatchdogOperation["status"] | null {
    const operation = this.operations.get(operationId)
    return operation ? operation.status : null
  }

  /**
   * Gets operation duration
   */
  getOperationDuration(operationId: string): number | null {
    const operation = this.operations.get(operationId)
    return operation ? Date.now() - operation.startTime : null
  }

  /**
   * Checks if operation is running
   */
  isOperationRunning(operationId: string): boolean {
    const operation = this.operations.get(operationId)
    return operation ? operation.status === "running" : false
  }

  /**
   * Gets all running operations
   */
  getRunningOperations(): string[] {
    return Array.from(this.operations.entries())
      .filter(([_, op]) => op.status === "running")
      .map(([id, _]) => id)
  }

  /**
   * Cancels all operations
   */
  cancelAll(): void {
    for (const operationId of this.operations.keys()) {
      this.cancelOperation(operationId)
    }
  }

  /**
   * Wraps a promise with timeout
   */
  async withTimeout<T>(operationId: string, promise: Promise<T>, config?: Partial<WatchdogConfig>): Promise<T> {
    this.startOperation(operationId, config)

    try {
      const result = await promise
      this.completeOperation(operationId, config?.onComplete)
      return result
    } catch (error) {
      this.cancelOperation(operationId)
      throw error
    }
  }
}
