export interface User {
  id: string
  email: string
  role: "user" | "admin"
  created_at: string
  last_login: string | null
  is_active: boolean
}

export interface Workflow {
  id: string
  user_id: string
  name: string
  description: string | null
  cubes: Cube[]
  connections: Connection[]
  status: "draft" | "active" | "paused" | "archived"
  created_at: string
  updated_at: string
}

export interface Cube {
  id: string
  type: string
  position: { x: number; y: number }
  config: Record<string, unknown>
}

export interface Connection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface Execution {
  id: string
  workflow_id: string
  user_id: string
  status: "pending" | "running" | "completed" | "failed" | "halted"
  started_at: string
  completed_at: string | null
  error_message: string | null
  execution_data: Record<string, unknown> | null
  results: Record<string, unknown> | null
}

export interface Task {
  id: string
  execution_id: string
  user_id: string
  cube_id: string
  task_type: string
  input_data: Record<string, unknown>
  output_data: Record<string, unknown> | null
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  started_at: string
  completed_at: string | null
  error_message: string | null
  api_provider: string | null
  api_model: string | null
  tokens_used: number | null
  cost_usd: number | null
}

export interface SmartCube {
  id: string
  user_id: string
  name: string
  description: string | null
  cube_type: string
  configuration: Record<string, unknown>
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id: string | null
  event_type: string
  event_data: Record<string, unknown> | null
  created_at: string
}
