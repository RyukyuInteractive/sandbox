import { z } from "zod"

export const zPartCode = z.object({
  type: z.literal("code"),
  code: z.string(),
  message_to_user: z.string(),
})
