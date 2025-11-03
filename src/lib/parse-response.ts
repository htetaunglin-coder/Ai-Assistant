import { ApplicationError } from "./error"

export type ParseResponseOptions = "json" | "text" | "blob" | "none" | "raw"

export async function parseResponse<T = unknown>(
  response: Response,
  parseResponse: ParseResponseOptions = "json",
): Promise<T> {
  try {
    switch (parseResponse) {
      case "raw":
        return response as T
      case "json":
        return (await response.json()) as T
      case "text":
        return (await response.text()) as T
      case "blob":
        return (await response.blob()) as T
      case "none":
        return undefined as T
      default:
        return (await response.json()) as T
    }
  } catch (parseError) {
    const cause = parseError instanceof Error ? parseError.message : String(parseError)
    throw new ApplicationError(
      "bad_request",
      `Failed to parse response as ${parseResponse}`,
      cause,
    )
  }
}
