/**
 * Core type definitions for SmartCube
 */

export type CubeType =
  | "loader-text"
  | "loader-json"
  | "loader-image"
  | "recognition-seeing"
  | "recognition-hearing"
  | "math"
  | "decider"
  | "text"
  | "image"
  | "saver-text"
  | "saver-image"
  | "saver-table"
  | "saver-json"

export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled"

export interface User {
  _id: string
  email: string
  passwordHash: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Workflow {
  _id: string
  userId: string
  name: string
  description?: string
  cubes: Cube[]
  connections: Connection[]
  createdAt: Date
  updatedAt: Date
}

export interface Cube {
  id: string
  type: CubeType
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export interface Connection {
  id: string
  sourceId: string
  targetId: string
  sourceHandle?: string
  targetHandle?: string
}

export interface Execution {
  _id: string
  workflowId: string
  userId: string
  status: ExecutionStatus
  startTime: Date
  endTime?: Date
  logs: ExecutionLog[]
  results: Record<string, any>
  error?: string
}

export interface ExecutionLog {
  timestamp: Date
  cubeId: string
  cubeName: string
  message: string
  level: "info" | "warning" | "error"
  data?: any
}
