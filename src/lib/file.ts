import * as fileType from "file-type"

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

export const ACCEPT_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".txt",
  ".md",
  ".json",
  ".csv",
  ".xls",
  ".xlsx",
]
async function validateFile(file: File): Promise<{ isValid: boolean; error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    }
  }

  const buffer = await file.arrayBuffer()
  const detected = await fileType.fileTypeFromBuffer(Buffer.from(buffer.slice(0, 1024)))

  const mime = detected?.mime ?? file.type

  if (!ALLOWED_FILE_TYPES.includes(mime)) {
    return {
      isValid: false,
      error: `File type not supported (${mime || "unknown"})`,
    }
  }

  return { isValid: true }
}

export { validateFile }
