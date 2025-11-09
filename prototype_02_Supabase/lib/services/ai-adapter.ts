import { AIProviderError } from "@/lib/utils/error-handler"
import { AITimeoutWatchdog } from "@/lib/utils/ai-timeout-watchdog"

export type AIProvider = "openrouter" | "azure" | "google"

export interface AIRequest {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  model?: string
}

export interface AIResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  provider: AIProvider
}

export interface ImageGenerationRequest {
  prompt: string
  size?: string
  model?: string
}

export interface ImageGenerationResponse {
  url: string
  model: string
  provider: AIProvider
}

export class AIAdapter {
  private static instance: AIAdapter
  private provider: AIProvider
  private watchdog: AITimeoutWatchdog

  private constructor() {
    this.provider = (process.env.AI_PROVIDER as AIProvider) || "openrouter"
    this.watchdog = AITimeoutWatchdog.getInstance()
  }

  static getInstance(): AIAdapter {
    if (!AIAdapter.instance) {
      AIAdapter.instance = new AIAdapter()
    }
    return AIAdapter.instance
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const operationId = this.watchdog.startOperation("text_generation")

    try {
      switch (this.provider) {
        case "openrouter":
          return await this.generateTextOpenRouter(request, operationId)
        case "azure":
          return await this.generateTextAzure(request, operationId)
        case "google":
          return await this.generateTextGoogle(request, operationId)
        default:
          throw new AIProviderError(`Unsupported provider: ${this.provider}`)
      }
    } catch (error) {
      this.watchdog.endOperation(operationId)
      throw error
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const operationId = this.watchdog.startOperation("image_generation")

    try {
      switch (this.provider) {
        case "openrouter":
          return await this.generateImageOpenRouter(request, operationId)
        case "azure":
          return await this.generateImageAzure(request, operationId)
        case "google":
          return await this.generateImageGoogle(request, operationId)
        default:
          throw new AIProviderError(`Unsupported provider: ${this.provider}`)
      }
    } catch (error) {
      this.watchdog.endOperation(operationId)
      throw error
    }
  }

  private async generateTextOpenRouter(request: AIRequest, operationId: string): Promise<AIResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new AIProviderError("OpenRouter API key not configured")
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: request.model || "openai/gpt-4o-mini",
        messages: [
          ...(request.systemPrompt ? [{ role: "system", content: request.systemPrompt }] : []),
          { role: "user", content: request.prompt },
        ],
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature || 0.7,
      }),
    })

    this.watchdog.endOperation(operationId)

    if (!response.ok) {
      const error = await response.text()
      throw new AIProviderError(`OpenRouter API error: ${error}`)
    }

    const data = await response.json()

    return {
      text: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: data.model,
      provider: "openrouter",
    }
  }

  private async generateTextAzure(request: AIRequest, operationId: string): Promise<AIResponse> {
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT

    if (!apiKey || !endpoint || !deployment) {
      throw new AIProviderError("Azure OpenAI credentials not configured")
    }

    const response = await fetch(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`,
      {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...(request.systemPrompt ? [{ role: "system", content: request.systemPrompt }] : []),
            { role: "user", content: request.prompt },
          ],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
        }),
      },
    )

    this.watchdog.endOperation(operationId)

    if (!response.ok) {
      const error = await response.text()
      throw new AIProviderError(`Azure OpenAI API error: ${error}`)
    }

    const data = await response.json()

    return {
      text: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: deployment,
      provider: "azure",
    }
  }

  private async generateTextGoogle(request: AIRequest, operationId: string): Promise<AIResponse> {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new AIProviderError("Google AI API key not configured")
    }

    const model = request.model || "gemini-pro"
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.systemPrompt ? `${request.systemPrompt}\n\n${request.prompt}` : request.prompt,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: request.maxTokens || 2000,
            temperature: request.temperature || 0.7,
          },
        }),
      },
    )

    this.watchdog.endOperation(operationId)

    if (!response.ok) {
      const error = await response.text()
      throw new AIProviderError(`Google AI API error: ${error}`)
    }

    const data = await response.json()

    return {
      text: data.candidates[0].content.parts[0].text,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      model,
      provider: "google",
    }
  }

  private async generateImageOpenRouter(
    request: ImageGenerationRequest,
    operationId: string,
  ): Promise<ImageGenerationResponse> {
    throw new AIProviderError("Image generation not supported by OpenRouter")
  }

  private async generateImageAzure(
    request: ImageGenerationRequest,
    operationId: string,
  ): Promise<ImageGenerationResponse> {
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT

    if (!apiKey || !endpoint) {
      throw new AIProviderError("Azure OpenAI credentials not configured")
    }

    const response = await fetch(
      `${endpoint}/openai/deployments/dall-e-3/images/generations?api-version=2024-02-15-preview`,
      {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: request.prompt,
          size: request.size || "1024x1024",
          n: 1,
        }),
      },
    )

    this.watchdog.endOperation(operationId)

    if (!response.ok) {
      const error = await response.text()
      throw new AIProviderError(`Azure OpenAI API error: ${error}`)
    }

    const data = await response.json()

    return {
      url: data.data[0].url,
      model: "dall-e-3",
      provider: "azure",
    }
  }

  private async generateImageGoogle(
    request: ImageGenerationRequest,
    operationId: string,
  ): Promise<ImageGenerationResponse> {
    throw new AIProviderError("Image generation not supported by Google AI yet")
  }
}
