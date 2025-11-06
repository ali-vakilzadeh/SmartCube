import { type NextRequest, NextResponse } from "next/server"
import { WorkflowModel } from "@/lib/models/workflow"
import { connectDB } from "@/lib/db/mongodb"
import { verifyAuth } from "@/lib/middleware/access-control"
import { handleError } from "@/lib/utils/error-handler"
import { AnalyticsLogger } from "@/lib/utils/analytics-logger"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await verifyAuth(req)

    const workflows = await WorkflowModel.find({ userId: user.id }).sort({ updatedAt: -1 }).select("-__v")

    return NextResponse.json({ workflows })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const user = await verifyAuth(req)
    const body = await req.json()

    const { name, description, cubes, connections } = body

    const workflow = await WorkflowModel.create({
      userId: user.id,
      name,
      description,
      cubes: cubes || [],
      connections: connections || [],
    })

    await AnalyticsLogger.log({
      userId: user.id,
      eventType: "workflow_created",
      metadata: { workflowId: workflow._id.toString() },
    })

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
