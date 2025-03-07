import { z } from "zod"

export const zPartMessage = z.object({
  type: z.literal("message"),
  content: z.string(),
})
