import { AIAdapter } from "@/lib/services/ai-adapter"
import { AppError } from "@/lib/utils/error-handler"
import { formatOutput } from "@/lib/utils/output-formatter"

export interface ImageCubeInput {
  prompt: string
  size?: string
  model?: string
}

export interface ImageCubeOutput {
  output: Buffer | string
  type: "image"
}

/**
 * Image Cube - AI image generation
 */
export class ImageCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<ImageCubeOutput> {
    const { prompt, size, model } = { ...config, ...inputs }

    if (!prompt) {
      throw new AppError("Prompt is required for image generation", 400)
    }

    const aiAdapter = AIAdapter.getInstance()

    try {
      const response = await aiAdapter.generateImage({
        prompt,
        size: size || "1024x1024",
        model,
      })

      const output = response.url
      return formatOutput({ output, type: "image" }, "image")
    } catch (error: any) {
      throw new AppError(`Image generation failed: ${error.message}`, 500)
    }
  }
}
