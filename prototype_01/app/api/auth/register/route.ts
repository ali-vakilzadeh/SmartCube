import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { asyncHandler } from "@/lib/utils/error-handler"

export const POST = asyncHandler(async (req: NextRequest) => {
  const { email, password } = await req.json()

  const authService = AuthService.getInstance()
  const { user, token } = await authService.register(email, password)

  return NextResponse.json(
    {
      user: {
        id: user._id?.toString(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    },
    { status: 201 },
  )
})
