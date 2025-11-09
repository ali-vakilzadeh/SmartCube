import { DataTypeValidator } from "@/lib/utils/data-type-validator"
import { AppError } from "@/lib/utils/error-handler"

/**
 * Loader Text Cube - Loads and validates text data
 */
export class LoaderTextCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<string> {
    const { content, filePath } = config

    if (!content && !filePath) {
      throw new AppError("Either content or filePath must be provided", 400)
    }

    let textData = content

    if (filePath) {
      // In a real implementation, this would read from file system or URL
      // For now, we'll use the content if provided
      textData = content || ""
    }

    if (!DataTypeValidator.validate(textData, "text")) {
      throw new AppError("Invalid text data format", 400)
    }

    return textData
  }
}

/**
 * Loader JSON Cube - Loads and validates JSON data
 */
export class LoaderJsonCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<object> {
    const { content, filePath } = config

    if (!content && !filePath) {
      throw new AppError("Either content or filePath must be provided", 400)
    }

    let jsonData = content

    if (typeof jsonData === "string") {
      try {
        jsonData = JSON.parse(jsonData)
      } catch (error) {
        throw new AppError("Invalid JSON format", 400)
      }
    }

    if (!DataTypeValidator.validate(jsonData, "json")) {
      throw new AppError("Invalid JSON data format", 400)
    }

    return jsonData
  }
}

/**
 * Loader Image Cube - Loads and validates image data
 */
export class LoaderImageCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<string> {
    const { imageUrl, imageData } = config

    if (!imageUrl && !imageData) {
      throw new AppError("Either imageUrl or imageData must be provided", 400)
    }

    // Return the image URL or data URL
    const result = imageUrl || imageData

    if (!DataTypeValidator.validate(result, "image")) {
      throw new AppError("Invalid image data format", 400)
    }

    return result
  }
}
