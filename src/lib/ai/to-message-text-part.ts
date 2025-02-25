import type { Message, UIMessage } from "ai"

export function toMessageTextPart(message: UIMessage | Message) {
  if (message.role !== "assistant") return null

  if (message.parts === undefined) return null

  if (message.parts.length === 0) return null

  const [part] = message.parts

  if (part.type !== "text") return null

  return part
}
