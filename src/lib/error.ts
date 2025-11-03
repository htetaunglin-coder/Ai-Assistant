export type ErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "offline"
  | "internal_server_error"

export class ApplicationError extends Error {
  readonly type: ErrorType
  readonly statusCode: number
  readonly userMessage: string
  readonly cause?: string

  constructor(type: ErrorType, userMessage?: string, cause?: string) {
    const message = userMessage || getDefaultMessage(type)
    super(message)

    this.type = type
    this.statusCode = getStatusCodeByType(type)
    this.userMessage = message
    this.cause = cause

    // Maintains proper stack trace for where error was thrown
    this.name = "ApplicationError"
    Error.captureStackTrace?.(this, ApplicationError)
  }

  toResponse(): Response {
    return Response.json(
      {
        error: this.type,
        message: this.userMessage,
        ...(this.cause && { cause: this.cause }),
      },
      { status: this.statusCode },
    )
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.userMessage,
      cause: this.cause,
      statusCode: this.statusCode,
    }
  }
}

function getDefaultMessage(type: ErrorType): string {
  switch (type) {
    case "bad_request":
      return "The request couldn't be processed. Please check your input."
    case "unauthorized":
      return "You need to sign in to continue."
    case "forbidden":
      return "You don't have permission to access this resource."
    case "not_found":
      return "The requested resource was not found."
    case "rate_limit":
      return "Too many requests. Please try again later."
    case "offline":
      return "Connection issue. Please check your internet."
    case "internal_server_error":
      return "Something went wrong. Please try again."
  }
}

export function getStatusCodeByType(type: ErrorType): number {
  switch (type) {
    case "bad_request":
      return 400
    case "unauthorized":
      return 401
    case "forbidden":
      return 403
    case "not_found":
      return 404
    case "rate_limit":
      return 429
    case "offline":
      return 503
    case "internal_server_error":
      return 500
  }
}

export function getTypeByStatusCode(statusCode: number): ErrorType {
  switch (statusCode) {
    case 400:
      return "bad_request"
    case 401:
      return "unauthorized"
    case 403:
      return "forbidden"
    case 404:
      return "not_found"
    case 429:
      return "rate_limit"
    case 503:
      return "offline"
    default:
      return "internal_server_error"
  }
}


