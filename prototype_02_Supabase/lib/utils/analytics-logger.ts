import { createClient as createServerClient } from "@/lib/supabase/server"
import type { AnalyticsEvent } from "@/lib/types/database"

export class AnalyticsLogger {
  private static instance: AnalyticsLogger

  private constructor() {}

  static getInstance(): AnalyticsLogger {
    if (!AnalyticsLogger.instance) {
      AnalyticsLogger.instance = new AnalyticsLogger()
    }
    return AnalyticsLogger.instance
  }

  async logEvent(userId: string | null, eventType: string, eventData?: Record<string, unknown>): Promise<void> {
    try {
      const supabase = await createServerClient()

      await supabase.from("analytics").insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData || null,
      })
    } catch (error) {
      console.error("[v0] Analytics logging failed:", error)
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  async logWorkflowExecution(
    userId: string,
    workflowId: string,
    executionId: string,
    status: "success" | "failure",
    duration: number,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logEvent(userId, "workflow_executed", {
      workflowId,
      executionId,
      status,
      duration,
      ...metadata,
    })
  }

  async logError(userId: string, error: Error, context?: Record<string, unknown>): Promise<void> {
    await this.logEvent(userId, "error", {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
    })
  }

  async logLogin(userId: string, email: string): Promise<void> {
    await this.logEvent(userId, "login", { email })
  }

  async getAnalytics(
    userId: string,
    filters?: {
      startDate?: string
      endDate?: string
      eventType?: string
    },
  ): Promise<AnalyticsEvent[]> {
    const supabase = await createServerClient()

    let query = supabase.from("analytics").select("*").eq("user_id", userId)

    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate)
    }

    if (filters?.eventType) {
      query = query.eq("event_type", filters.eventType)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(1000)

    if (error) {
      console.error("[v0] Error fetching analytics:", error)
      return []
    }

    return data || []
  }
}
