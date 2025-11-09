import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { asyncHandler } from "@/lib/utils/error-handler"

export const POST = asyncHandler(async (req: NextRequest) => {
  const { email, password, role } = await req.json()

  const authService = AuthService.getInstance()
  const { user, needsEmailConfirmation } = await authService.register(email, password, role || "user")

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
      needsEmailConfirmation,
      message: needsEmailConfirmation
        ? "Please check your email to confirm your account"
        : "Account created successfully",
    },
    { status: 201 },
  )
})
