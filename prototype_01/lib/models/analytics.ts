import type { ObjectId } from "mongodb"

export interface AnalyticsLog {
  _id?: ObjectId
  userId: string
  workflowId?: string
  executionId?: string
  eventType:
    | "workflow_created"
    | "workflow_executed"
    | "workflow_failed"
    | "cube_executed"
    | "error"
    | "login"
    | "logout"
  metadata: Record<string, any>
  timestamp: Date
  duration?: number
  status?: "success" | "failure"
}
