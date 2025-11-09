import { createClient as createServerClient } from "@/lib/supabase/server"
import type { Workflow, Cube, Connection } from "@/lib/types/database"
import { ValidationError, NotFoundError } from "@/lib/utils/error-handler"
import { AnalyticsLogger } from "@/lib/utils/analytics-logger"

export class WorkflowService {
  private static instance: WorkflowService
  private analytics: AnalyticsLogger

  private constructor() {
    this.analytics = AnalyticsLogger.getInstance()
  }

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService()
    }
    return WorkflowService.instance
  }

  async createWorkflow(
    userId: string,
    name: string,
    description?: string,
    cubes: Cube[] = [],
    connections: Connection[] = [],
  ): Promise<Workflow> {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Workflow name is required")
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("workflows")
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        cubes: cubes,
        connections: connections,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating workflow:", error)
      throw new Error("Failed to create workflow")
    }

    await this.analytics.logEvent(userId, "workflow_created", { workflowId: data.id })

    return data
  }

  async getWorkflowById(workflowId: string, userId: string): Promise<Workflow | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("[v0] Error fetching workflow:", error)
      throw new Error("Failed to fetch workflow")
    }

    return data
  }

  async getUserWorkflows(userId: string): Promise<Workflow[]> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching workflows:", error)
      throw new Error("Failed to fetch workflows")
    }

    return data || []
  }

  async updateWorkflow(
    workflowId: string,
    userId: string,
    updates: Partial<Omit<Workflow, "id" | "user_id" | "created_at" | "updated_at">>,
  ): Promise<Workflow> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("workflows")
      .update(updates)
      .eq("id", workflowId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Workflow not found")
      }
      console.error("[v0] Error updating workflow:", error)
      throw new Error("Failed to update workflow")
    }

    await this.analytics.logEvent(userId, "workflow_updated", { workflowId: data.id })

    return data
  }

  async deleteWorkflow(workflowId: string, userId: string): Promise<void> {
    const supabase = await createServerClient()

    const { error } = await supabase.from("workflows").delete().eq("id", workflowId).eq("user_id", userId)

    if (error) {
      console.error("[v0] Error deleting workflow:", error)
      throw new Error("Failed to delete workflow")
    }

    await this.analytics.logEvent(userId, "workflow_deleted", { workflowId })
  }
}
