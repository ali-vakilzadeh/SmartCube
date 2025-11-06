import { connectToDatabase } from "@/lib/db/mongodb"
import type { User, UserSession } from "@/lib/models/user"
import { TokenManager } from "@/lib/utils/token-manager"
import { ValidationError, AuthenticationError } from "@/lib/utils/error-handler"
import { AnalyticsLogger } from "@/lib/utils/analytics-logger"
import bcrypt from "bcryptjs"

export class AuthService {
  private static instance: AuthService
  private tokenManager: TokenManager
  private analytics: AnalyticsLogger

  private constructor() {
    this.tokenManager = TokenManager.getInstance()
    this.analytics = AnalyticsLogger.getInstance()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async register(email: string, password: string): Promise<{ user: User; token: string }> {
    // Validate input
    if (!email || !password) {
      throw new ValidationError("Email and password are required")
    }

    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format")
    }

    const { db } = await connectToDatabase()

    // Check if user exists
    const existingUser = await db.collection<User>("users").findOne({ email })
    if (existingUser) {
      throw new ValidationError("User already exists")
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user: User = {
      email,
      passwordHash,
      role: "user",
      createdAt: new Date(),
      isActive: true,
    }

    const result = await db.collection<User>("users").insertOne(user)
    user._id = result.insertedId

    // Generate token
    const session: UserSession = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    }

    const token = this.tokenManager.generateToken(session)

    // Log registration
    await this.analytics.logLogin(user._id.toString(), email)

    return { user, token }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (!email || !password) {
      throw new ValidationError("Email and password are required")
    }

    const { db } = await connectToDatabase()

    // Find user
    const user = await db.collection<User>("users").findOne({ email })
    if (!user) {
      throw new AuthenticationError("Invalid credentials")
    }

    if (!user.isActive) {
      throw new AuthenticationError("Account is disabled")
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      throw new AuthenticationError("Invalid credentials")
    }

    // Update last login
    await db.collection<User>("users").updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    // Generate token
    const session: UserSession = {
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    }

    const token = this.tokenManager.generateToken(session)

    // Log login
    await this.analytics.logLogin(user._id!.toString(), email)

    return { user, token }
  }

  async getUserById(userId: string): Promise<User | null> {
    const { db } = await connectToDatabase()
    const { ObjectId } = await import("mongodb")

    return db.collection<User>("users").findOne({ _id: new ObjectId(userId) })
  }
}
