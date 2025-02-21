import { z } from "zod"

export const zAssistantObjectChat = z.object({
  message_to_user: z.string(),
})
