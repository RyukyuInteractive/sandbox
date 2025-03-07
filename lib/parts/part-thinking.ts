import { z } from "zod"

export const zPartThinking = z.object({
  type: z.literal("thinking"),
  content: z.string(),
})
