import { Schema, model, models } from "mongoose"

const ExecutionSchema = new Schema(
  {
    workflowId: { type: Schema.Types.ObjectId, ref: "Workflow", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["running", "completed", "error", "halted"],
      default: "running",
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        cubeId: String,
        cubeName: String,
        message: String,
        level: { type: String, enum: ["info", "error", "warning"] },
      },
    ],
    results: Schema.Types.Mixed,
    error: String,
    iteration: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Execution = models.Execution || model("Execution", ExecutionSchema)
