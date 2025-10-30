// Adapted from https://github.com/vercel/ai-chatbot/blob/main/lib/errors.ts

export type ErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "offline"
  | "internal_server_error"

export type Surface = "chat" | "auth" | "api" | "conversation"

export type ErrorCode = `${ErrorType}:${Surface}`

export type ErrorVisibility = "response" | "log" | "none"

export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  chat: "response",
  auth: "response",
  api: "response",
  conversation: "response",
}

export class ChatSDKError extends Error {
  type: ErrorType
  surface: Surface
  statusCode: number

  constructor(errorCode: ErrorCode, cause?: string) {
    super()

    const [type, surface] = errorCode.split(":")

    this.type = type as ErrorType
    this.cause = cause
    this.surface = surface as Surface
    this.message = getMessageByErrorCode(errorCode)
    this.statusCode = getStatusCodeByType(this.type)
  }

  toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`
    const visibility = visibilityBySurface[this.surface]

    const { message, cause, statusCode } = this

    if (visibility === "log") {
      console.error({
        code,
        message,
        cause,
      })

      return Response.json(
        { code: "", message: "Something went wrong. Please try again later." },
        { status: statusCode },
      )
    }

    return Response.json({ code, message, cause }, { status: statusCode })
  }
}

export function getMessageByErrorCode(errorCode: ErrorCode): string {
  switch (errorCode) {
    case "bad_request:api":
      return "The request couldn't be processed. Please check your input and try again."
    case "internal_server_error:api":
      return "Something went wrong on our end. Please try again later."

    case "unauthorized:auth":
      return "You need to sign in before continuing."
    case "forbidden:auth":
      return "Your account does not have access to this feature."

    case "bad_request:chat":
      return "The request couldn't be processed. Please check your input and try again."
    case "rate_limit:chat":
      return "You have exceeded your maximum number of messages for the day. Please try again later."
    case "not_found:chat":
      return "The requested chat was not found. Please check the chat ID and try again."
    case "forbidden:chat":
      return "This chat belongs to another user. Please check the chat ID and try again."
    case "unauthorized:chat":
      return "You need to sign in to view this chat. Please sign in and try again."
    case "offline:chat":
      return "We're having trouble sending your message. Please check your internet connection and try again."
    case "internal_server_error:chat":
      return "Something went wrong while processing your message. Please try again."

    case "not_found:conversation":
      return "The requested conversation was not found."
    case "forbidden:conversation":
      return "You don't have access to this conversation."
    case "unauthorized:conversation":
      return "You need to sign in to view this conversation."
    case "internal_server_error:conversation":
      return "Something went wrong while loading the conversation. Please try again."

    default:
      return "Something went wrong. Please try again later."
  }
}

function getStatusCodeByType(type: ErrorType) {
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
    default:
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
