import { parsePartialJson } from "@ai-sdk/ui-utils"
import type { DeepPartial, Message, UIMessage } from "ai"
import { z } from "zod"
import { toMessageTextPart } from "~/lib/ai/to-message-text-part"
import { zPart } from "~/lib/parts/part"

export function toCodeBlock(message: UIMessage | Message) {
  const part = toMessageTextPart(message)

  if (part === null) return null

  try {
    const json = parsePartialJson(part.text)

    if (json.value === undefined) return null

    const zBlock = z.array(zPart)

    const blocks = json.value as DeepPartial<z.infer<typeof zBlock>>

    const block = blocks[blocks.length - 1]

    if (block === undefined) return null

    if (block.type !== "file") return null

    if (block.content === undefined) return null

    return block
  } catch (error) {
    console.error("Failed to parse JSON:", error)
    return null
  }
}
