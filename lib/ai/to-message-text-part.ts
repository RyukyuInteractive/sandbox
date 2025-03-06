import type { Message, UIMessage } from "ai"

export function toMessageTextPart(message: UIMessage | Message) {
  if (message.role !== "assistant") return null

  if (message.parts === undefined) return null

  if (message.parts.length === 0) return null

  for (const part of message.parts) {
    if (part.type !== "text") continue
    if (part.text === "") continue
    return part
  }

  return null
}
