import { z } from "zod"

export const zAssistantObjectShadcnuiDeps = z.object({
  components: z.array(z.string()),
  message_to_user: z.string(),
})
