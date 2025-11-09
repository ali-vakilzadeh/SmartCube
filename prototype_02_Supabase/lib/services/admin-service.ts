import { createClient as createServerClient } from "@/lib/supabase/server"
import type { User } from "@/lib/types/database"
import { NotFoundError } from "@/lib/utils/error-handler"

export class AdminService {
  private static instance: AdminService

  private constructor() {}

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService()
    }
    return AdminService.instance
  }

  async listUsers(page = 1, limit = 50): Promise<{ users: User[]; total: number }> {
    const supabase = await createServerClient()

    const start = (page - 1) * limit
    const end = start + limit - 1

    const [usersResult, countResult] = await Promise.all([
      supabase.from("users").select("*").range(start, end).order("created_at", { ascending: false }),
      supabase.from("users").select("*", { count: "exact", head: true }),
    ])

    if (usersResult.error) {
      console.error("[v0] Error fetching users:", usersResult.error)
      throw new Error("Failed to fetch users")
    }

    return {
      users: usersResult.data || [],
      total: countResult.count || 0,
    }
  }

  async getUserById(userId: string): Promise<User> {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error || !data) {
      throw new NotFoundError("User")
    }

    return data
  }

  async updateUserRole(userId: string, role: "user" | "admin"): Promise<User> {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("users").update({ role }).eq("id", userId).select().single()

    if (error || !data) {
      throw new NotFoundError("User")
    }

    return data
  }

  async toggleUserStatus(userId: string): Promise<User> {
    const supabase = await createServerClient()

    // First get current status
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("is_active")
      .eq("id", userId)
      .single()

    if (fetchError || !currentUser) {
      throw new NotFoundError("User")
    }

    // Toggle the status
    const { data, error } = await supabase
      .from("users")
      .update({ is_active: !currentUser.is_active })
      .eq("id", userId)
      .select()
      .single()

    if (error || !data) {
      throw new NotFoundError("User")
    }

    return data
  }

  async deleteUser(userId: string): Promise<void> {
    const supabase = await createServerClient()

    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("[v0] Error deleting user:", error)
      throw new Error("Failed to delete user")
    }
  }
}
