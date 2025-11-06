import { type NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin-service"
import { asyncHandler } from "@/lib/utils/error-handler"
import { withAdmin } from "@/lib/middleware/access-control"

export const POST = asyncHandler(
  withAdmin(async (req: NextRequest, user, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params
    const adminService = AdminService.getInstance()
    const updatedUser = await adminService.toggleUserStatus(userId)

    return NextResponse.json({
      user: {
        id: updatedUser._id?.toString(),
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    })
  }),
)
