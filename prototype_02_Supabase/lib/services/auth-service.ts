import { createClient as createServerClient } from "@/lib/supabase/server"
import type { User } from "@/lib/types/database"
import { ValidationError, AuthenticationError } from "@/lib/utils/error-handler"
import { AnalyticsLogger } from "@/lib/utils/analytics-logger"

export class AuthService {
  private static instance: AuthService
  private analytics: AnalyticsLogger

  private constructor() {
    this.analytics = AnalyticsLogger.getInstance()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async register(
    email: string,
    password: string,
    role: "user" | "admin" = "user",
  ): Promise<{ user: User; needsEmailConfirmation: boolean }> {
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

    const supabase = await createServerClient()

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
        },
      },
    })

    if (authError) {
      if (authError.message.includes("already registered")) {
        throw new ValidationError("User already exists")
      }
      throw new AuthenticationError(authError.message)
    }

    if (!authData.user) {
      throw new AuthenticationError("Failed to create user")
    }

    // The user profile is automatically created by the trigger
    // Fetch the created user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (userError && userError.code !== "PGRST116") {
      // PGRST116 is "not found" - expected if email confirmation is required
      console.error("[v0] Error fetching user profile:", userError)
    }

    const user: User = userData || {
      id: authData.user.id,
      email: authData.user.email!,
      role: role,
      created_at: new Date().toISOString(),
      last_login: null,
      is_active: true,
    }

    // Log registration
    if (authData.session) {
      await this.analytics.logEvent(user.id, "user_registered", { email })
    }

    return {
      user,
      needsEmailConfirmation: !authData.session,
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("[v0] Error fetching user:", error)
      return null
    }

    return data
  }

  async updateLastLogin(userId: string): Promise<void> {
    const supabase = await createServerClient()

    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", userId)
  }

  async getCurrentUser(): Promise<User | null> {
    const supabase = await createServerClient()

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return null
    }

    return this.getUserById(authUser.id)
  }
}
