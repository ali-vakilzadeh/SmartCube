/**
 * Token Manager
 * Priority: 1 (No dependencies)
 * Manages JWT tokens for authentication
 */

import jwt from "jsonwebtoken"

export interface TokenPayload {
  userId: string
  email: string
  role: "user" | "admin"
  iat?: number
  exp?: number
}

export class TokenManager {
  private static readonly SECRET = process.env.JWT_SECRET || "default-secret-change-in-production"
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

  /**
   * Generates a JWT token
   */
  static generateToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
    try {
      return jwt.sign(payload, this.SECRET, {
        expiresIn: this.EXPIRES_IN,
      })
    } catch (error) {
      throw new Error(`Token generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Verifies and decodes a JWT token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.SECRET) as TokenPayload
      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired")
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token")
      }
      throw new Error(`Token verification failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Decodes token without verification (for debugging)
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload
    } catch (error) {
      return null
    }
  }

  /**
   * Checks if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token)
      if (!decoded || !decoded.exp) {
        return true
      }
      return Date.now() >= decoded.exp * 1000
    } catch (error) {
      return true
    }
  }

  /**
   * Extracts token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) {
      return null
    }

    const parts = authHeader.split(" ")
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null
    }

    return parts[1]
  }

  /**
   * Refreshes a token (generates new token with same payload)
   */
  static refreshToken(token: string): string {
    const payload = this.verifyToken(token)

    // Remove iat and exp from payload
    const { iat, exp, ...newPayload } = payload

    return this.generateToken(newPayload)
  }
}
