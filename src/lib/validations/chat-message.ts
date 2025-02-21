import { z } from "zod"
import { zAssistantMessage } from "~/lib/validations/assistant-message"
import { zUserMessage } from "~/lib/validations/user-message"

export const zChatMessage = z.union([zAssistantMessage, zUserMessage])
