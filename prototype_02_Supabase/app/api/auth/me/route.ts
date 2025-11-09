import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { asyncHandler } from "@/lib/utils/error-handler"
import { withAuth } from "@/lib/middleware/access-control"

export const GET = asyncHandler(
  withAuth(async (req: NextRequest, user) => {
    const authService = AuthService.getInstance()
    const fullUser = await authService.getUserById(user.id)

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
        createdAt: fullUser.created_at,
        lastLogin: fullUser.last_login,
      },
    })
  }),
)
