import { connectToDatabase } from "@/lib/db/mongodb"
import type { AnalyticsLog } from "@/lib/models/analytics"

export class AnalyticsLogger {
  private static instance: AnalyticsLogger

  private constructor() {}

  static getInstance(): AnalyticsLogger {
    if (!AnalyticsLogger.instance) {
      AnalyticsLogger.instance = new AnalyticsLogger()
    }
    return AnalyticsLogger.instance
  }

  async log(log: Omit<AnalyticsLog, "_id" | "timestamp">): Promise<void> {
    try {
      const { db } = await connectToDatabase()
      await db.collection<AnalyticsLog>("analytics").insertOne({
        ...log,
        timestamp: new Date(),
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
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      userId,
      workflowId,
      executionId,
      eventType: "workflow_executed",
      status,
      duration,
      metadata: metadata || {},
    })
  }

  async logError(userId: string, error: Error, context?: Record<string, any>): Promise<void> {
    await this.log({
      userId,
      eventType: "error",
      status: "failure",
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack,
        ...context,
      },
    })
  }

  async logLogin(userId: string, email: string): Promise<void> {
    await this.log({
      userId,
      eventType: "login",
      status: "success",
      metadata: { email },
    })
  }

  async getAnalytics(
    userId: string,
    filters?: {
      startDate?: Date
      endDate?: Date
      eventType?: string
    },
  ): Promise<AnalyticsLog[]> {
    const { db } = await connectToDatabase()

    const query: any = { userId }

    if (filters?.startDate || filters?.endDate) {
      query.timestamp = {}
      if (filters.startDate) query.timestamp.$gte = filters.startDate
      if (filters.endDate) query.timestamp.$lte = filters.endDate
    }

    if (filters?.eventType) {
      query.eventType = filters.eventType
    }

    return db.collection<AnalyticsLog>("analytics").find(query).sort({ timestamp: -1 }).limit(1000).toArray()
  }
}
