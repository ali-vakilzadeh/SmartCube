/**
 * Data Type Validator
 * Priority: 1 (No dependencies)
 * Validates data types for cube inputs/outputs
 */

export type DataType = "text" | "json" | "image" | "audio" | "number" | "boolean" | "array" | "object"

export interface ValidationResult {
  valid: boolean
  type: DataType | null
  error?: string
}

export class DataTypeValidator {
  /**
   * Validates if data matches expected type
   */
  static validate(data: any, expectedType: DataType): ValidationResult {
    try {
      const actualType = this.detectType(data)

      if (actualType === expectedType) {
        return { valid: true, type: actualType }
      }

      // Allow compatible types
      if (this.isCompatible(actualType, expectedType)) {
        return { valid: true, type: actualType }
      }

      return {
        valid: false,
        type: actualType,
        error: `Expected type '${expectedType}' but got '${actualType}'`,
      }
    } catch (error) {
      return {
        valid: false,
        type: null,
        error: error instanceof Error ? error.message : "Validation error",
      }
    }
  }

  /**
   * Detects the type of data
   */
  static detectType(data: any): DataType {
    if (data === null || data === undefined) {
      throw new Error("Data is null or undefined")
    }

    if (typeof data === "string") {
      // Check if it's a base64 image
      if (this.isBase64Image(data)) {
        return "image"
      }
      // Check if it's a base64 audio
      if (this.isBase64Audio(data)) {
        return "audio"
      }
      return "text"
    }

    if (typeof data === "number") {
      return "number"
    }

    if (typeof data === "boolean") {
      return "boolean"
    }

    if (Array.isArray(data)) {
      return "array"
    }

    if (typeof data === "object") {
      return "json"
    }

    throw new Error(`Unknown data type: ${typeof data}`)
  }

  /**
   * Checks if two types are compatible
   */
  private static isCompatible(actualType: DataType, expectedType: DataType): boolean {
    const compatibilityMap: Record<DataType, DataType[]> = {
      text: ["text"],
      json: ["json", "object"],
      object: ["json", "object"],
      image: ["image", "text"], // base64 images are text
      audio: ["audio", "text"], // base64 audio is text
      number: ["number"],
      boolean: ["boolean"],
      array: ["array", "json"],
    }

    return compatibilityMap[expectedType]?.includes(actualType) || false
  }

  /**
   * Checks if string is a base64 encoded image
   */
  private static isBase64Image(str: string): boolean {
    return /^data:image\/(png|jpg|jpeg|gif|webp);base64,/.test(str)
  }

  /**
   * Checks if string is a base64 encoded audio
   */
  private static isBase64Audio(str: string): boolean {
    return /^data:audio\/(mp3|wav|ogg|webm);base64,/.test(str)
  }

  /**
   * Validates multiple data items
   */
  static validateBatch(items: Array<{ data: any; expectedType: DataType }>): ValidationResult[] {
    return items.map((item) => this.validate(item.data, item.expectedType))
  }
}
