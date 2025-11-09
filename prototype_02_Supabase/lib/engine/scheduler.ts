import type { Workflow, Cube, Connection, ExecutionLog } from "@/lib/types"
import { WorkflowValidator } from "./workflow-validator"
import { CubeExecutor, type CubeExecutionContext } from "./cube-executor"
import { LoopController } from "@/lib/utils/loop-controller"
import { AppError } from "@/lib/utils/error-handler"

export interface SchedulerContext {
  workflowId: string
  executionId: string
  userId: string
  onLog?: (log: ExecutionLog) => void
  onProgress?: (progress: number) => void
}

export interface SchedulerResult {
  success: boolean
  results: Record<string, any>
  logs: ExecutionLog[]
  error?: string
}

export class Scheduler {
  private loopController: LoopController
  private logs: ExecutionLog[] = []
  private results: Record<string, any> = {}

  constructor() {
    this.loopController = new LoopController()
  }

  /**
   * Executes a workflow sequentially
   */
  async execute(workflow: Workflow, context: SchedulerContext): Promise<SchedulerResult> {
    try {
      // Validate workflow
      const validation = WorkflowValidator.validate(workflow)
      if (!validation.valid) {
        throw new AppError(`Workflow validation failed: ${validation.errors.join(", ")}`, 400)
      }

      // Get execution order
      const executionOrder = WorkflowValidator.getExecutionOrder(workflow.cubes, workflow.connections)

      this.addLog(context, "system", "System", `Starting workflow execution with ${executionOrder.length} cubes`)

      // Execute cubes in order
      for (let i = 0; i < executionOrder.length; i++) {
        const cubeId = executionOrder[i]
        const cube = workflow.cubes.find((c) => c.id === cubeId)

        if (!cube) {
          throw new AppError(`Cube not found: ${cubeId}`, 404)
        }

        // Check if this is a loop iteration
        const loopIteration = this.loopController.getCurrentIteration()

        // Execute cube
        const cubeContext: CubeExecutionContext = {
          cubeId: cube.id,
          inputs: this.getInputsForCube(cube, workflow.connections),
          config: cube.config,
          workflowId: context.workflowId,
          executionId: context.executionId,
          loopIteration,
        }

        this.addLog(context, cube.id, cube.name, `Executing cube (iteration ${loopIteration})`)

        const result = await CubeExecutor.execute(cube, cubeContext)

        // Add cube logs
        for (const log of result.logs) {
          this.addLog(context, cube.id, cube.name, log)
        }

        if (!result.success) {
          throw new AppError(`Cube execution failed: ${result.error}`, 500)
        }

        // Store result
        this.results[cube.id] = result.output

        // Handle Decider cube - check if we need to loop
        if (cube.type === "decider" && result.output?.decision === true) {
          const canLoop = this.loopController.canLoop()

          if (canLoop) {
            this.loopController.incrementIteration()
            this.addLog(
              context,
              cube.id,
              cube.name,
              `Decision is true, starting loop iteration ${this.loopController.getCurrentIteration()}`,
            )

            // Reset to beginning of workflow
            i = -1 // Will be incremented to 0 in next iteration
            continue
          } else {
            this.addLog(context, cube.id, cube.name, `Decision is true but max iterations (2) reached, continuing`)
          }
        }

        // Report progress
        if (context.onProgress) {
          const progress = ((i + 1) / executionOrder.length) * 100
          context.onProgress(progress)
        }
      }

      this.addLog(context, "system", "System", "Workflow execution completed successfully")

      return {
        success: true,
        results: this.results,
        logs: this.logs,
      }
    } catch (error: any) {
      this.addLog(context, "system", "System", `Workflow execution failed: ${error.message}`, "error")

      return {
        success: false,
        results: this.results,
        logs: this.logs,
        error: error.message,
      }
    }
  }

  /**
   * Gets inputs for a cube from previous cube outputs
   */
  private getInputsForCube(cube: Cube, connections: Connection[]): Record<string, any> {
    const inputs: Record<string, any> = {}

    // Find all connections that target this cube
    const incomingConnections = connections.filter((conn) => conn.targetId === cube.id)

    for (const conn of incomingConnections) {
      const sourceOutput = this.results[conn.sourceId]
      if (sourceOutput !== undefined) {
        // Use the source handle as the input key, or default to 'input'
        const inputKey = conn.targetHandle || "input"
        inputs[inputKey] = sourceOutput
      }
    }

    // Merge with cube config (config can provide default inputs)
    return { ...cube.config, ...inputs }
  }

  /**
   * Adds a log entry
   */
  private addLog(
    context: SchedulerContext,
    cubeId: string,
    cubeName: string,
    message: string,
    level: "info" | "warning" | "error" = "info",
  ): void {
    const log: ExecutionLog = {
      timestamp: new Date(),
      cubeId,
      cubeName,
      message,
      level,
    }

    this.logs.push(log)

    if (context.onLog) {
      context.onLog(log)
    }
  }
}
