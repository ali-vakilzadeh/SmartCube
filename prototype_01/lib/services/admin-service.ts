import { connectToDatabase } from "@/lib/db/mongodb"
import type { User } from "@/lib/models/user"
import { ObjectId } from "mongodb"
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
    const { db } = await connectToDatabase()

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db
        .collection<User>("users")
        .find({})
        .project({ passwordHash: 0 }) // Don't return password hashes
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection<User>("users").countDocuments(),
    ])

    return { users, total }
  }

  async getUserById(userId: string): Promise<User> {
    const { db } = await connectToDatabase()

    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { passwordHash: 0 } })

    if (!user) {
      throw new NotFoundError("User")
    }

    return user
  }

  async updateUserRole(userId: string, role: "user" | "admin"): Promise<User> {
    const { db } = await connectToDatabase()

    const result = await db
      .collection<User>("users")
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { role } },
        { returnDocument: "after", projection: { passwordHash: 0 } },
      )

    if (!result) {
      throw new NotFoundError("User")
    }

    return result
  }

  async toggleUserStatus(userId: string): Promise<User> {
    const { db } = await connectToDatabase()

    const user = await db.collection<User>("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      throw new NotFoundError("User")
    }

    const result = await db
      .collection<User>("users")
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { isActive: !user.isActive } },
        { returnDocument: "after", projection: { passwordHash: 0 } },
      )

    return result!
  }

  async deleteUser(userId: string): Promise<void> {
    const { db } = await connectToDatabase()

    const result = await db.collection<User>("users").deleteOne({ _id: new ObjectId(userId) })

    if (result.deletedCount === 0) {
      throw new NotFoundError("User")
    }
  }
}
