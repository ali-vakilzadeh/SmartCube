import { type NextRequest, NextResponse } from "next/server"
import { asyncHandler } from "@/lib/utils/error-handler"
import { AuthService } from "@/lib/services/auth-service"

export const POST = asyncHandler(async (req: NextRequest) => {
  const authService = AuthService.getInstance()
  const user = await authService.getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Update last login
  await authService.updateLastLogin(user.id)

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      lastLogin: user.last_login,
    },
  })
})
