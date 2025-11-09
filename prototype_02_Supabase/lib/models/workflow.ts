import { Schema, model, models } from "mongoose"

const CubeSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  config: { type: Schema.Types.Mixed, default: {} },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
})

const ConnectionSchema = new Schema({
  id: { type: String, required: true },
  sourceId: { type: String, required: true },
  targetId: { type: String, required: true },
  sourceHandle: String,
  targetHandle: String,
})

const WorkflowSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: String,
  cubes: [CubeSchema],
  connections: [ConnectionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

WorkflowSchema.index({ userId: 1, createdAt: -1 })

export const WorkflowModel = models.Workflow || model("Workflow", WorkflowSchema)
