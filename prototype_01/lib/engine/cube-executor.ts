import type { Cube } from "@/lib/types"
import { AppError } from "@/lib/utils/error-handler"
import { OutputFormatter } from "@/lib/utils/output-formatter"
import { AITimeoutWatchdog } from "@/lib/utils/ai-timeout-watchdog"

// Import all cube implementations
import { LoaderTextCube, LoaderJsonCube, LoaderImageCube } from "@/lib/cubes/loader-cubes"
import { RecognitionSeeingCube, RecognitionHearingCube } from "@/lib/cubes/recognition-cubes"
import { MathCube } from "@/lib/cubes/math-cube"
import { DeciderCube } from "@/lib/cubes/decider-cube"
import { TextCube } from "@/lib/cubes/text-cube"
import { ImageCube } from "@/lib/cubes/image-cube"
import { SaverTextCube, SaverImageCube, SaverTableCube, SaverJsonCube } from "@/lib/cubes/saver-cubes"

export interface CubeExecutionContext {
  cubeId: string
  inputs: Record<string, any>
  config: Record<string, any>
  workflowId: string
  executionId: string
  loopIteration: number
}

export interface CubeExecutionResult {
  success: boolean
  output: any
  error?: string
  logs: string[]
  metadata?: Record<string, any>
}

export class CubeExecutor {
  private static cubeHandlers = new Map<string, any>([
    ["loader-text", LoaderTextCube],
    ["loader-json", LoaderJsonCube],
    ["loader-image", LoaderImageCube],
    ["recognition-seeing", RecognitionSeeingCube],
    ["recognition-hearing", RecognitionHearingCube],
    ["math", MathCube],
    ["decider", DeciderCube],
    ["text", TextCube],
    ["image", ImageCube],
    ["saver-text", SaverTextCube],
    ["saver-image", SaverImageCube],
    ["saver-table", SaverTableCube],
    ["saver-json", SaverJsonCube],
  ])

  /**
   * Executes a single cube
   */
  static async execute(cube: Cube, context: CubeExecutionContext): Promise<CubeExecutionResult> {
    const logs: string[] = []

    try {
      logs.push(`Starting execution of cube: ${cube.name} (${cube.type})`)

      // Get the appropriate handler
      const Handler = this.cubeHandlers.get(cube.type)
      if (!Handler) {
        throw new AppError(`Unknown cube type: ${cube.type}`, 400)
      }

      // Validate inputs if cube has input requirements
      const inputValidation = this.validateInputs(cube, context.inputs)
      if (!inputValidation.valid) {
        throw new AppError(`Input validation failed: ${inputValidation.errors.join(", ")}`, 400)
      }

      // Create handler instance
      const handler = new Handler()

      // Execute with timeout watchdog for AI operations
      let output: any
      const isAICube = ["recognition-seeing", "recognition-hearing", "text", "image"].includes(cube.type)

      if (isAICube) {
        const watchdog = new AITimeoutWatchdog(60000) // 60 second timeout
        output = await watchdog.execute(async () => {
          return await handler.execute(context.inputs, cube.config)
        })
      } else {
        output = await handler.execute(context.inputs, cube.config)
      }

      // Format output
      const formattedOutput = OutputFormatter.format(output, cube.type)

      logs.push(`Cube execution completed successfully`)

      return {
        success: true,
        output: formattedOutput,
        logs,
        metadata: {
          cubeType: cube.type,
          executionTime: Date.now(),
        },
      }
    } catch (error: any) {
      logs.push(`Cube execution failed: ${error.message}`)

      return {
        success: false,
        output: null,
        error: error.message,
        logs,
      }
    }
  }

  /**
   * Validates cube inputs
   */
  private static validateInputs(cube: Cube, inputs: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Define required inputs for each cube type
    const inputRequirements: Record<string, string[]> = {
      "loader-text": [],
      "loader-json": [],
      "loader-image": [],
      "recognition-seeing": ["image"],
      "recognition-hearing": ["audio"],
      math: ["expression"],
      decider: ["value1", "operator", "value2"],
      text: ["prompt"],
      image: ["prompt"],
      "saver-text": ["content"],
      "saver-image": ["imageData"],
      "saver-table": ["data"],
      "saver-json": ["data"],
    }

    const required = inputRequirements[cube.type] || []
    for (const field of required) {
      if (!(field in inputs) || inputs[field] === undefined || inputs[field] === null) {
        errors.push(`Missing required input: ${field}`)
      }
    }

    return { valid: errors.length === 0, errors }
  }
}
