import { z } from "zod"

export const zPartMessage = z.object({
  type: z.literal("message"),
  message_to_user: z.string(),
})
