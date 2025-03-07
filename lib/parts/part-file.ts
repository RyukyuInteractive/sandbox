import { z } from "zod"

export const zPartFile = z.object({
  type: z.literal("file"),
  path: z.string(),
  content: z.string(),
})
