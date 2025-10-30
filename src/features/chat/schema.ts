import z from "zod"

const chatStreamRequestBodySchema = z.object({
  content: z.string().min(1),
  conversation_id: z.string().nullable(),
  web_search: z.boolean(),
})

type chatStreamRequestBody = z.infer<typeof chatStreamRequestBodySchema>

export { chatStreamRequestBodySchema, type chatStreamRequestBody }
