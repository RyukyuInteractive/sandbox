import { z } from "zod"

export const zUserMessage = z.object({
  id: z.string().nullable(),
  role: z.literal("user"),
  content: z.string(),
})
