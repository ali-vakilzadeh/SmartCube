import { type NextRequest, NextResponse } from "next/server"
import { WorkflowService } from "@/lib/services/workflow-service"
import { asyncHandler, NotFoundError } from "@/lib/utils/error-handler"
import { withAuth } from "@/lib/middleware/access-control"

export const GET = asyncHandler(
  withAuth(async (req: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const workflowService = WorkflowService.getInstance()

    const workflow = await workflowService.getWorkflowById(id, user.id)

    if (!workflow) {
      throw new NotFoundError("Workflow")
    }

    return NextResponse.json({ workflow })
  }),
)

export const PUT = asyncHandler(
  withAuth(async (req: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const body = await req.json()
    const { name, description, cubes, connections, status } = body

    const workflowService = WorkflowService.getInstance()

    const workflow = await workflowService.updateWorkflow(id, user.id, {
      name,
      description,
      cubes,
      connections,
      status,
    })

    return NextResponse.json({ workflow })
  }),
)

export const DELETE = asyncHandler(
  withAuth(async (req: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const workflowService = WorkflowService.getInstance()

    await workflowService.deleteWorkflow(id, user.id)

    return NextResponse.json({ message: "Workflow deleted successfully" })
  }),
)
