import { type NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin-service"
import { asyncHandler } from "@/lib/utils/error-handler"
import { withAdmin } from "@/lib/middleware/access-control"

export const GET = asyncHandler(
  withAdmin(async (req: NextRequest, user, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params
    const adminService = AdminService.getInstance()
    const targetUser = await adminService.getUserById(userId)

    return NextResponse.json({
      user: {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.is_active,
        createdAt: targetUser.created_at,
        lastLogin: targetUser.last_login,
      },
    })
  }),
)

export const PATCH = asyncHandler(
  withAdmin(async (req: NextRequest, user, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params
    const { role } = await req.json()

    const adminService = AdminService.getInstance()
    const updatedUser = await adminService.updateUserRole(userId, role)

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.is_active,
      },
    })
  }),
)

export const DELETE = asyncHandler(
  withAdmin(async (req: NextRequest, user, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params
    const adminService = AdminService.getInstance()
    await adminService.deleteUser(userId)

    return NextResponse.json({ message: "User deleted successfully" })
  }),
)
