import { z } from "zod"
import { zAssistantMessage } from "~/lib/validations/assistant-message"

export const zAssistantStream = z.array(zAssistantMessage)
