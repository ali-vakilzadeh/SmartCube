import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { verifyAuth } from "@/lib/middleware/access-control"
import { handleError } from "@/lib/utils/error-handler"
import { ExecutionManager } from "@/lib/engine/execution-manager"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const user = await verifyAuth(req)

    const execution = await ExecutionManager.getExecution(params.id, user.id)

    return NextResponse.json({ execution })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const user = await verifyAuth(req)

    await ExecutionManager.cancelExecution(params.id, user.id)

    return NextResponse.json({ message: "Execution cancelled successfully" })
  } catch (error) {
    return handleError(error)
  }
}
