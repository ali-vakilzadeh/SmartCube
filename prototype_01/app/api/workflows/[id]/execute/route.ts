import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { verifyAuth } from "@/lib/middleware/access-control"
import { handleError } from "@/lib/utils/error-handler"
import { ExecutionManager } from "@/lib/engine/execution-manager"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const user = await verifyAuth(req)

    const executionId = await ExecutionManager.startExecution({
      userId: user.id,
      workflowId: params.id,
    })

    return NextResponse.json({ executionId }, { status: 202 })
  } catch (error) {
    return handleError(error)
  }
}
