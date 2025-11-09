import { type NextRequest, NextResponse } from "next/server"
import { asyncHandler, NotFoundError } from "@/lib/utils/error-handler"
import { withAuth } from "@/lib/middleware/access-control"
import { ExecutionService } from "@/lib/services/execution-service"

export const GET = asyncHandler(
  withAuth(async (req: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const executionService = ExecutionService.getInstance()

    const execution = await executionService.getExecutionById(id, user.id)

    if (!execution) {
      throw new NotFoundError("Execution")
    }

    // Also fetch associated tasks
    const tasks = await executionService.getExecutionTasks(id, user.id)

    return NextResponse.json({
      execution,
      tasks,
    })
  }),
)

export const DELETE = asyncHandler(
  withAuth(async (req: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const executionService = ExecutionService.getInstance()

    // Cancel the execution by updating status
    await executionService.updateExecutionStatus(id, user.id, "halted")

    return NextResponse.json({ message: "Execution cancelled successfully" })
  }),
)
