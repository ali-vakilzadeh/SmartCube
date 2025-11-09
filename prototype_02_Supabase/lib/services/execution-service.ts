import { createClient as createServerClient } from "@/lib/supabase/server"
import type { Execution, Task } from "@/lib/types/database"
import { AnalyticsLogger } from "@/lib/utils/analytics-logger"

export class ExecutionService {
  private static instance: ExecutionService
  private analytics: AnalyticsLogger

  private constructor() {
    this.analytics = AnalyticsLogger.getInstance()
  }

  static getInstance(): ExecutionService {
    if (!ExecutionService.instance) {
      ExecutionService.instance = new ExecutionService()
    }
    return ExecutionService.instance
  }

  async createExecution(
    workflowId: string,
    userId: string,
    executionData?: Record<string, unknown>,
  ): Promise<Execution> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("executions")
      .insert({
        workflow_id: workflowId,
        user_id: userId,
        status: "pending",
        execution_data: executionData || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating execution:", error)
      throw new Error("Failed to create execution")
    }

    await this.analytics.logEvent(userId, "execution_started", {
      workflowId,
      executionId: data.id,
    })

    return data
  }

  async getExecutionById(executionId: string, userId: string): Promise<Execution | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("executions")
      .select("*")
      .eq("id", executionId)
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("[v0] Error fetching execution:", error)
      throw new Error("Failed to fetch execution")
    }

    return data
  }

  async updateExecutionStatus(
    executionId: string,
    userId: string,
    status: Execution["status"],
    errorMessage?: string,
    results?: Record<string, unknown>,
  ): Promise<Execution> {
    const supabase = await createServerClient()

    const updates: Partial<Execution> = {
      status,
      error_message: errorMessage || null,
      results: results || null,
    }

    if (status === "completed" || status === "failed" || status === "halted") {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("executions")
      .update(updates)
      .eq("id", executionId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating execution:", error)
      throw new Error("Failed to update execution")
    }

    await this.analytics.logEvent(userId, "execution_status_changed", {
      executionId,
      status,
    })

    return data
  }

  async createTask(
    executionId: string,
    userId: string,
    cubeId: string,
    taskType: string,
    inputData: Record<string, unknown>,
  ): Promise<Task> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        execution_id: executionId,
        user_id: userId,
        cube_id: cubeId,
        task_type: taskType,
        input_data: inputData,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating task:", error)
      throw new Error("Failed to create task")
    }

    return data
  }

  async updateTaskStatus(
    taskId: string,
    userId: string,
    status: Task["status"],
    outputData?: Record<string, unknown>,
    errorMessage?: string,
  ): Promise<Task> {
    const supabase = await createServerClient()

    const updates: Partial<Task> = {
      status,
      output_data: outputData || null,
      error_message: errorMessage || null,
    }

    if (status === "completed" || status === "failed" || status === "cancelled") {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating task:", error)
      throw new Error("Failed to update task")
    }

    return data
  }

  async getExecutionTasks(executionId: string, userId: string): Promise<Task[]> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("execution_id", executionId)
      .eq("user_id", userId)
      .order("started_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching tasks:", error)
      throw new Error("Failed to fetch tasks")
    }

    return data || []
  }
}
