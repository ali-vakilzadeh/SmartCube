import { type NextRequest, NextResponse } from "next/server"
import { WorkflowService } from "@/lib/services/workflow-service"
import { asyncHandler } from "@/lib/utils/error-handler"
import { withAuth } from "@/lib/middleware/access-control"

export const GET = asyncHandler(
  withAuth(async (req: NextRequest, user) => {
    const workflowService = WorkflowService.getInstance()
    const workflows = await workflowService.getUserWorkflows(user.id)

    return NextResponse.json({ workflows })
  }),
)

export const POST = asyncHandler(
  withAuth(async (req: NextRequest, user) => {
    const body = await req.json()
    const { name, description, cubes, connections } = body

    const workflowService = WorkflowService.getInstance()
    const workflow = await workflowService.createWorkflow(user.id, name, description, cubes, connections)

    return NextResponse.json({ workflow }, { status: 201 })
  }),
)
