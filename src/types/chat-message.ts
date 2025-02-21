import type { z } from "zod"
import type { zChatMessage } from "~/lib/validations/chat-message"

export type ChatMessage = z.infer<typeof zChatMessage>
