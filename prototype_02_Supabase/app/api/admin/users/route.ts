import { type NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin-service"
import { asyncHandler } from "@/lib/utils/error-handler"
import { withAdmin } from "@/lib/middleware/access-control"

export const GET = asyncHandler(
  withAdmin(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const adminService = AdminService.getInstance()
    const { users, total } = await adminService.listUsers(page, limit)

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        isActive: u.is_active,
        createdAt: u.created_at,
        lastLogin: u.last_login,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  }),
)
