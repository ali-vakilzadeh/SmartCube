/**
 * Anonymization Middleware
 * Priority: 1 (No dependencies)
 * Anonymizes sensitive data in logs and outputs
 */

export interface AnonymizationConfig {
  enabled: boolean
  patterns: {
    email: boolean
    phone: boolean
    ssn: boolean
    creditCard: boolean
    ipAddress: boolean
    customPatterns?: RegExp[]
  }
}

export class AnonymizationMiddleware {
  private static readonly DEFAULT_CONFIG: AnonymizationConfig = {
    enabled: true,
    patterns: {
      email: true,
      phone: true,
      ssn: true,
      creditCard: true,
      ipAddress: true,
    },
  }

  private static readonly PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(\+\d{1,3}[-.]?)?$$?\d{3}$$?[-.]?\d{3}[-.]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  }

  /**
   * Anonymizes text based on configuration
   */
  static anonymize(text: string, config: Partial<AnonymizationConfig> = {}): string {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }

    if (!finalConfig.enabled) {
      return text
    }

    let anonymized = text

    // Apply built-in patterns
    if (finalConfig.patterns.email) {
      anonymized = anonymized.replace(this.PATTERNS.email, "[EMAIL_REDACTED]")
    }

    if (finalConfig.patterns.phone) {
      anonymized = anonymized.replace(this.PATTERNS.phone, "[PHONE_REDACTED]")
    }

    if (finalConfig.patterns.ssn) {
      anonymized = anonymized.replace(this.PATTERNS.ssn, "[SSN_REDACTED]")
    }

    if (finalConfig.patterns.creditCard) {
      anonymized = anonymized.replace(this.PATTERNS.creditCard, "[CARD_REDACTED]")
    }

    if (finalConfig.patterns.ipAddress) {
      anonymized = anonymized.replace(this.PATTERNS.ipAddress, "[IP_REDACTED]")
    }

    // Apply custom patterns
    if (finalConfig.patterns.customPatterns) {
      finalConfig.patterns.customPatterns.forEach((pattern) => {
        anonymized = anonymized.replace(pattern, "[CUSTOM_REDACTED]")
      })
    }

    return anonymized
  }

  /**
   * Anonymizes object recursively
   */
  static anonymizeObject(obj: any, config: Partial<AnonymizationConfig> = {}): any {
    if (typeof obj === "string") {
      return this.anonymize(obj, config)
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.anonymizeObject(item, config))
    }

    if (obj !== null && typeof obj === "object") {
      const anonymized: any = {}
      for (const key in obj) {
        anonymized[key] = this.anonymizeObject(obj[key], config)
      }
      return anonymized
    }

    return obj
  }

  /**
   * Masks partial data (e.g., show last 4 digits of credit card)
   */
  static maskPartial(text: string, visibleChars = 4, maskChar = "*"): string {
    if (text.length <= visibleChars) {
      return text
    }

    const masked = maskChar.repeat(text.length - visibleChars)
    const visible = text.slice(-visibleChars)
    return masked + visible
  }

  /**
   * Anonymizes email (keeps domain)
   */
  static anonymizeEmail(email: string): string {
    const parts = email.split("@")
    if (parts.length !== 2) {
      return "[EMAIL_REDACTED]"
    }

    const username = parts[0]
    const domain = parts[1]
    const maskedUsername =
      username.length > 2 ? username[0] + "*".repeat(username.length - 2) + username[username.length - 1] : "***"

    return `${maskedUsername}@${domain}`
  }
}
