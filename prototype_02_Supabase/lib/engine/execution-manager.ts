import { ExecutionModel } from "@/lib/models/execution"
import { WorkflowModel } from "@/lib/models/workflow"
import { Scheduler, type SchedulerContext, type SchedulerResult } from "./scheduler"
import { AppError } from "@/lib/utils/error-handler"
import { AnalyticsLogger } from "@/lib/utils/analytics-logger"
import type { ExecutionLog } from "@/lib/types"

export interface ExecutionOptions {
  userId: string
  workflowId: string
  onLog?: (log: ExecutionLog) => void
  onProgress?: (progress: number) => void
}

export class ExecutionManager {
  /**
   * Starts a workflow execution
   */
  static async startExecution(options: ExecutionOptions): Promise<string> {
    try {
      // Fetch workflow
      const workflow = await WorkflowModel.findById(options.workflowId)
      if (!workflow) {
        throw new AppError("Workflow not found", 404)
      }

      // Check ownership
      if (workflow.userId.toString() !== options.userId) {
        throw new AppError("Unauthorized to execute this workflow", 403)
      }

      // Create execution record
      const execution = await ExecutionModel.create({
        workflowId: options.workflowId,
        userId: options.userId,
        status: "running",
        startTime: new Date(),
        logs: [],
        results: {},
      })

      // Log analytics
      await AnalyticsLogger.log({
        userId: options.userId,
        eventType: "workflow_execution_started",
        metadata: {
          workflowId: options.workflowId,
          executionId: execution._id.toString(),
        },
      })

      // Execute workflow asynchronously
      this.executeWorkflow(execution._id.toString(), workflow, options).catch(console.error)

      return execution._id.toString()
    } catch (error: any) {
      throw new AppError(`Failed to start execution: ${error.message}`, 500)
    }
  }

  /**
   * Executes a workflow
   */
  private static async executeWorkflow(executionId: string, workflow: any, options: ExecutionOptions): Promise<void> {
    try {
      const scheduler = new Scheduler()

      const context: SchedulerContext = {
        workflowId: workflow._id.toString(),
        executionId,
        userId: options.userId,
        onLog: async (log: ExecutionLog) => {
          // Update execution with new log
          await ExecutionModel.findByIdAndUpdate(executionId, {
            $push: { logs: log },
          })

          // Call user callback
          if (options.onLog) {
            options.onLog(log)
          }
        },
        onProgress: options.onProgress,
      }

      const result: SchedulerResult = await scheduler.execute(workflow, context)

      // Update execution record
      await ExecutionModel.findByIdAndUpdate(executionId, {
        status: result.success ? "completed" : "failed",
        endTime: new Date(),
        results: result.results,
        error: result.error,
        logs: result.logs,
      })

      // Log analytics
      await AnalyticsLogger.log({
        userId: options.userId,
        eventType: result.success ? "workflow_execution_completed" : "workflow_execution_failed",
        metadata: {
          workflowId: workflow._id.toString(),
          executionId,
          error: result.error,
        },
      })
    } catch (error: any) {
      // Update execution as failed
      await ExecutionModel.findByIdAndUpdate(executionId, {
        status: "failed",
        endTime: new Date(),
        error: error.message,
      })

      // Log analytics
      await AnalyticsLogger.log({
        userId: options.userId,
        eventType: "workflow_execution_failed",
        metadata: {
          workflowId: workflow._id.toString(),
          executionId,
          error: error.message,
        },
      })
    }
  }

  /**
   * Cancels a running execution
   */
  static async cancelExecution(executionId: string, userId: string): Promise<void> {
    const execution = await ExecutionModel.findById(executionId)

    if (!execution) {
      throw new AppError("Execution not found", 404)
    }

    if (execution.userId.toString() !== userId) {
      throw new AppError("Unauthorized to cancel this execution", 403)
    }

    if (execution.status !== "running") {
      throw new AppError("Execution is not running", 400)
    }

    await ExecutionModel.findByIdAndUpdate(executionId, {
      status: "cancelled",
      endTime: new Date(),
    })

    await AnalyticsLogger.log({
      userId,
      eventType: "workflow_execution_cancelled",
      metadata: { executionId },
    })
  }

  /**
   * Gets execution status
   */
  static async getExecution(executionId: string, userId: string) {
    const execution = await ExecutionModel.findById(executionId)

    if (!execution) {
      throw new AppError("Execution not found", 404)
    }

    if (execution.userId.toString() !== userId) {
      throw new AppError("Unauthorized to view this execution", 403)
    }

    return execution
  }

  /**
   * Lists executions for a workflow
   */
  static async listExecutions(workflowId: string, userId: string, limit = 20) {
    const executions = await ExecutionModel.find({
      workflowId,
      userId,
    })
      .sort({ startTime: -1 })
      .limit(limit)

    return executions
  }
}
