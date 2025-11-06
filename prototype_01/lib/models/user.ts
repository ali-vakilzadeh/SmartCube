import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  passwordHash: string
  role: "user" | "admin"
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

export interface UserSession {
  userId: string
  email: string
  role: "user" | "admin"
}
