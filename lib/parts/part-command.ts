import { z } from "zod"

export const zPartCommand = z.object({
  type: z.literal("command"),
  command: z.string(),
})
