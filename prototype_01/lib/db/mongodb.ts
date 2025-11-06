import { MongoClient, type Db } from "mongodb"

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined")
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    db = client.db()
    console.log("[v0] Connected to MongoDB")
    return db
  } catch (error) {
    console.error("[v0] MongoDB connection error:", error)
    throw error
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log("[v0] MongoDB connection closed")
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectToDatabase first.")
  }
  return db
}
