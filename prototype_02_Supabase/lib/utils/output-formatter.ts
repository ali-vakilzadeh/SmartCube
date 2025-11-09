/**
 * Output Formatter
 * Priority: 1 (No dependencies)
 * Formats cube outputs for consistency
 */

export interface FormattedOutput {
  success: boolean
  data: any
  type: string
  timestamp: string
  metadata?: Record<string, any>
}

export class OutputFormatter {
  /**
   * Formats successful output
   */
  static success(data: any, type: string, metadata?: Record<string, any>): FormattedOutput {
    return {
      success: true,
      data,
      type,
      timestamp: new Date().toISOString(),
      metadata,
    }
  }

  /**
   * Formats error output
   */
  static error(error: string | Error, type: string, metadata?: Record<string, any>): FormattedOutput {
    const errorMessage = error instanceof Error ? error.message : error

    return {
      success: false,
      data: { error: errorMessage },
      type,
      timestamp: new Date().toISOString(),
      metadata,
    }
  }

  /**
   * Formats text output
   */
  static text(text: string, metadata?: Record<string, any>): FormattedOutput {
    return this.success(text, "text", metadata)
  }

  /**
   * Formats JSON output
   */
  static json(data: any, metadata?: Record<string, any>): FormattedOutput {
    return this.success(data, "json", metadata)
  }

  /**
   * Formats image output
   */
  static image(imageData: string, metadata?: Record<string, any>): FormattedOutput {
    return this.success(imageData, "image", metadata)
  }

  /**
   * Formats audio output
   */
  static audio(audioData: string, metadata?: Record<string, any>): FormattedOutput {
    return this.success(audioData, "audio", metadata)
  }

  /**
   * Formats number output
   */
  static number(value: number, metadata?: Record<string, any>): FormattedOutput {
    return this.success(value, "number", metadata)
  }

  /**
   * Formats boolean output
   */
  static boolean(value: boolean, metadata?: Record<string, any>): FormattedOutput {
    return this.success(value, "boolean", metadata)
  }

  /**
   * Converts FormattedOutput to plain object for storage
   */
  static toPlainObject(output: FormattedOutput): Record<string, any> {
    return {
      success: output.success,
      data: output.data,
      type: output.type,
      timestamp: output.timestamp,
      ...(output.metadata && { metadata: output.metadata }),
    }
  }

  /**
   * Parses plain object back to FormattedOutput
   */
  static fromPlainObject(obj: Record<string, any>): FormattedOutput {
    return {
      success: obj.success,
      data: obj.data,
      type: obj.type,
      timestamp: obj.timestamp,
      metadata: obj.metadata,
    }
  }
}
