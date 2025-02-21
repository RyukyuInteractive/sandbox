import { z } from "zod"

export const zAssistantObjectShadcnuiCode = z.object({
  code: z.string(),
  message_to_user: z.string(),
})
