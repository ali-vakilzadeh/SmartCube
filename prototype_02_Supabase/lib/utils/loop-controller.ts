/**
 * Loop Controller
 * Priority: 1 (No dependencies)
 * Manages loop iterations with 2-loop limit
 */

export interface LoopState {
  currentIteration: number
  maxIterations: number
  canContinue: boolean
  loopStartCubeId: string
  loopEndCubeId: string
}

export class LoopController {
  private static readonly MAX_ITERATIONS = 2
  private loopStates: Map<string, LoopState> = new Map()

  /**
   * Initializes a new loop
   */
  initLoop(loopId: string, startCubeId: string, endCubeId: string): LoopState {
    const state: LoopState = {
      currentIteration: 0,
      maxIterations: LoopController.MAX_ITERATIONS,
      canContinue: true,
      loopStartCubeId: startCubeId,
      loopEndCubeId: endCubeId,
    }

    this.loopStates.set(loopId, state)
    return state
  }

  /**
   * Increments loop iteration
   */
  incrementIteration(loopId: string): LoopState {
    const state = this.loopStates.get(loopId)

    if (!state) {
      throw new Error(`Loop ${loopId} not initialized`)
    }

    state.currentIteration++
    state.canContinue = state.currentIteration < state.maxIterations

    this.loopStates.set(loopId, state)
    return state
  }

  /**
   * Checks if loop can continue
   */
  canContinue(loopId: string): boolean {
    const state = this.loopStates.get(loopId)

    if (!state) {
      throw new Error(`Loop ${loopId} not initialized`)
    }

    return state.canContinue
  }

  /**
   * Gets current loop state
   */
  getLoopState(loopId: string): LoopState | undefined {
    return this.loopStates.get(loopId)
  }

  /**
   * Resets a loop
   */
  resetLoop(loopId: string): void {
    const state = this.loopStates.get(loopId)

    if (state) {
      state.currentIteration = 0
      state.canContinue = true
      this.loopStates.set(loopId, state)
    }
  }

  /**
   * Clears all loop states
   */
  clearAll(): void {
    this.loopStates.clear()
  }

  /**
   * Gets all active loops
   */
  getActiveLoops(): string[] {
    return Array.from(this.loopStates.keys())
  }

  /**
   * Checks if loop limit reached
   */
  isLimitReached(loopId: string): boolean {
    const state = this.loopStates.get(loopId)
    return state ? state.currentIteration >= state.maxIterations : false
  }
}
