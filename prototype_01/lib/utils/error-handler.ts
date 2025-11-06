import { NextResponse } from "next/server"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, "VALIDATION_ERROR", details)
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(401, message, "AUTH_ERROR")
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(403, message, "AUTHORIZATION_ERROR")
    this.name = "AuthorizationError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class AIProviderError extends AppError {
  constructor(message: string, details?: any) {
    super(500, message, "AI_PROVIDER_ERROR", details)
    this.name = "AIProviderError"
  }
}

export function handleError(error: unknown) {
  console.error("[v0] Error occurred:", error)

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode },
    )
  }

  // Unknown error
  return NextResponse.json(
    {
      error: {
        message: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      },
    },
    { status: 500 },
  )
}

export function asyncHandler(handler: (req: Request, context?: any) => Promise<Response>) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleError(error)
    }
  }
}
