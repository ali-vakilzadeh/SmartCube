import { AIAdapter } from "@/lib/services/ai-adapter"
import { AppError } from "@/lib/utils/error-handler"

/**
 * Text Cube - AI text generation and transformation
 */
export class TextCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<string> {
    const { prompt, context, systemPrompt, maxTokens, temperature } = { ...config, ...inputs }

    if (!prompt) {
      throw new AppError("Prompt is required for text generation", 400)
    }

    const aiAdapter = AIAdapter.getInstance()

    try {
      // Build full prompt with context if provided
      let fullPrompt = prompt
      if (context) {
        fullPrompt = `Context: ${JSON.stringify(context)}\n\n${prompt}`
      }

      const response = await aiAdapter.generateText({
        prompt: fullPrompt,
        systemPrompt,
        maxTokens: maxTokens || 2000,
        temperature: temperature || 0.7,
      })

      return response.text
    } catch (error: any) {
      throw new AppError(`Text generation failed: ${error.message}`, 500)
    }
  }
}
