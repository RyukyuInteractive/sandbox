import { z } from "zod"

export const zAssistantObjectContext = z.object({
  context: z.string(),
})
