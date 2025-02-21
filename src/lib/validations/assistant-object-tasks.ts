import { z } from "zod"

export const zAssistantObjectTasks = z.object({
  functions: z.array(z.string()),
  message_to_user: z.string(),
})
