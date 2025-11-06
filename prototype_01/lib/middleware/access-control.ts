import type { NextRequest } from "next/server"
import { TokenManager } from "@/lib/utils/token-manager"
import { AuthenticationError, AuthorizationError } from "@/lib/utils/error-handler"
import type { UserSession } from "@/lib/models/user"

export async function requireAuth(req: NextRequest): Promise<UserSession> {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("No token provided")
  }

  const token = authHeader.substring(7)
  const tokenManager = TokenManager.getInstance()

  const payload = tokenManager.verifyToken(token)

  if (!payload) {
    throw new AuthenticationError("Invalid or expired token")
  }

  return payload as UserSession
}

export async function requireAdmin(req: NextRequest): Promise<UserSession> {
  const user = await requireAuth(req)

  if (user.role !== "admin") {
    throw new AuthorizationError("Admin access required")
  }

  return user
}

export function withAuth(handler: (req: NextRequest, user: UserSession, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    const user = await requireAuth(req)
    return handler(req, user, context)
  }
}

export function withAdmin(handler: (req: NextRequest, user: UserSession, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    const user = await requireAdmin(req)
    return handler(req, user, context)
  }
}
