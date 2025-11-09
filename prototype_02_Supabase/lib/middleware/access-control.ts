import type { NextRequest } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { AuthenticationError, AuthorizationError } from "@/lib/utils/error-handler"

export interface AuthenticatedUser {
  id: string
  email: string
  role: "user" | "admin"
}

export async function requireAuth(req: NextRequest): Promise<AuthenticatedUser> {
  const supabase = await createServerClient()

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !authUser) {
    throw new AuthenticationError("Authentication required")
  }

  // Fetch user profile from database
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single()

  if (profileError || !userProfile) {
    throw new AuthenticationError("User profile not found")
  }

  if (!userProfile.is_active) {
    throw new AuthenticationError("Account is disabled")
  }

  return {
    id: userProfile.id,
    email: userProfile.email,
    role: userProfile.role,
  }
}

export async function requireAdmin(req: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuth(req)

  if (user.role !== "admin") {
    throw new AuthorizationError("Admin access required")
  }

  return user
}

export function withAuth(handler: (req: NextRequest, user: AuthenticatedUser, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    const user = await requireAuth(req)
    return handler(req, user, context)
  }
}

export function withAdmin(handler: (req: NextRequest, user: AuthenticatedUser, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    const user = await requireAdmin(req)
    return handler(req, user, context)
  }
}
