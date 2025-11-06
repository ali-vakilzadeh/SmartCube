import { type NextRequest, NextResponse } from "next/server"
import { WorkflowModel } from "@/lib/models/workflow"
import { connectDB } from "@/lib/db/mongodb"
import { verifyAuth } from "@/lib/middleware/access-control"
import { handleError, AppError } from "@/lib/utils/error-handler"
import { AnalyticsLogger } from "@/lib/utils/analytics-logger"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const user = await verifyAuth(req)

    const workflow = await WorkflowModel.findById(params.id)
    if (!workflow) {
      throw new AppError("Workflow not found", 404)
    }

    if (workflow.userId.toString() !== user.id) {
      throw new AppError("Unauthorized", 403)
    }

    return NextResponse.json({ workflow })
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const user = await verifyAuth(req)
    const body = await req.json()

    const workflow = await WorkflowModel.findById(params.id)
    if (!workflow) {
      throw new AppError("Workflow not found", 404)
    }

    if (workflow.userId.toString() !== user.id) {
      throw new AppError("Unauthorized", 403)
    }

    const { name, description, cubes, connections } = body

    workflow.name = name || workflow.name
    workflow.description = description !== undefined ? description : workflow.description
    workflow.cubes = cubes || workflow.cubes
    workflow.connections = connections || workflow.connections
    workflow.updatedAt = new Date()

    await workflow.save()

    await AnalyticsLogger.log({
      userId: user.id,
      eventType: "workflow_updated",
      metadata: { workflowId: workflow._id.toString() },
    })

    return NextResponse.json({ workflow })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const user = await verifyAuth(req)

    const workflow = await WorkflowModel.findById(params.id)
    if (!workflow) {
      throw new AppError("Workflow not found", 404)
    }

    if (workflow.userId.toString() !== user.id) {
      throw new AppError("Unauthorized", 403)
    }

    await WorkflowModel.findByIdAndDelete(params.id)

    await AnalyticsLogger.log({
      userId: user.id,
      eventType: "workflow_deleted",
      metadata: { workflowId: params.id },
    })

    return NextResponse.json({ message: "Workflow deleted successfully" })
  } catch (error) {
    return handleError(error)
  }
}
