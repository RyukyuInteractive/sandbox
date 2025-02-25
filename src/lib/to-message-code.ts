import { parsePartialJson } from "@ai-sdk/ui-utils"
import type { DeepPartial, Message, UIMessage } from "ai"
import type { z } from "zod"
import { toMessageTextPart } from "~/lib/ai/to-message-text-part"
import type { zPart } from "~/lib/parts/part"

export function toMessageCode(message: UIMessage | Message) {
  const part = toMessageTextPart(message)

  if (part === null) return null

  const json = parsePartialJson(part.text)

  if (json.value === undefined) return null

  const block = json.value as DeepPartial<z.infer<typeof zPart>>

  if (block.type !== "code") return null

  if (block.code === undefined) return null

  return block.code
}
