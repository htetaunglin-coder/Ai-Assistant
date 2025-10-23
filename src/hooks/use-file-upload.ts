import { useCallback, useState } from "react"
import { validateFile } from "@/lib/file"

export type Attachment = {
  id: string
  name: string
  contentType: string
  url: string
  size: number
}

export type FileWithStatus = {
  file: File
  status: "validating" | "uploading" | "success"
  preview?: string
  attachment?: Attachment // Store result after upload
}

export type useFileUploadProps = {
  onError: (message: string) => void
  conversationId: string
  uid: string
}

export const useFileUpload = ({ onError, conversationId, uid }: useFileUploadProps) => {
  const [filesWithStatus, setFilesWithStatus] = useState<FileWithStatus[]>([])

  const handleFileUpload = useCallback(
    async (newFiles: File[]) => {
      // Validate first, before adding to state
      const validationResults = await Promise.all(
        newFiles.map(async (file) => {
          const validation = await validateFile(file)
          return { file, ...validation }
        }),
      )

      // Collect all errors and show as single toast
      const invalidFiles = validationResults.filter((r) => !r.isValid)
      if (invalidFiles.length > 0) {
        const errorMessages = invalidFiles.map(({ file, error }) => `• ${file.name}: ${error}`)
        onError(errorMessages.join("\n"))

        // Also cleanup any blob URLs for invalid images
        invalidFiles.forEach(({ file }) => {
          if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file)
            URL.revokeObjectURL(url)
          }
        })
      }

      // Only add valid files to state
      const validFiles = validationResults.filter((r) => r.isValid).map((r) => r.file)

      if (validFiles.length > 0) {
        // Now add only valid files with previews
        const filesWithPreviews = validFiles.map((file) => {
          let preview: string | undefined
          if (file.type.startsWith("image/")) {
            preview = URL.createObjectURL(file)
          }

          return {
            file,
            status: "uploading" as const,
            preview,
          }
        })

        setFilesWithStatus((prev) => [...prev, ...filesWithPreviews])

        try {
          const attachments = await processFiles(validFiles, conversationId, uid)

          // Mark as success and store attachment data
          setFilesWithStatus((prev) => {
            const updated = [...prev]
            validFiles.forEach((file, i) => {
              const index = updated.findIndex((f) => f.file === file)
              if (index !== -1) {
                updated[index] = {
                  ...updated[index],
                  status: "success",
                  attachment: attachments[i],
                }
              }
            })
            return updated
          })
        } catch (_) {
          // Show single error for all failed uploads
          const fileNames = validFiles.map((f) => f.name).join(", ")
          onError(`Upload failed for: ${fileNames}`)

          setFilesWithStatus((prev) => prev.filter((f) => !validFiles.some((valid) => valid === f.file)))
        }
      }
    },
    [onError, conversationId, uid],
  )

  const handleFileRemove = useCallback((file: File) => {
    setFilesWithStatus((prev) => {
      const removed = prev.find((f) => f.file === file)
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return prev.filter((f) => f.file !== file)
    })
  }, [])

  const getSuccessfulAttachments = useCallback((): Attachment[] => {
    return filesWithStatus.filter((f) => f.status === "success" && f.attachment).map((f) => f.attachment!)
  }, [filesWithStatus])

  const clearAll = useCallback(() => {
    filesWithStatus.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview)
    })
    setFilesWithStatus([])
  }, [filesWithStatus])

  return {
    filesWithStatus,
    handleFileUpload,
    handleFileRemove,
    getSuccessfulAttachments,
    clearAll,
  }
}

/* -------------------------------------------------------------------------- */

// Backend isn't ready yet, so we are just gonna make a fake network request.
// eslint-disable-next-line
async function processFiles(files: File[], conversationId: string, uid: string): Promise<Attachment[]> {
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate upload

  return files.map((file) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: file.name,
    contentType: file.type,
    url: URL.createObjectURL(file),
    size: file.size,
  }))
}
