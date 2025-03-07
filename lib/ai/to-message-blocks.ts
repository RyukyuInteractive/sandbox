import { parsePartialJson } from "@ai-sdk/ui-utils"
import type { DeepPartial, Message, UIMessage } from "ai"
import { z } from "zod"
import { toMessageTextPart } from "~/lib/ai/to-message-text-part"
import { zPart } from "~/lib/parts/part"

/**
 * @deprecated
 */
export function toMessageBlocks(message: UIMessage | Message) {
  const part = toMessageTextPart(message)

  if (part === null) return []

  try {
    const json = parsePartialJson(part.text)

    if (json.value === undefined) return []

    const zBlock = z.array(zPart)

    return json.value as DeepPartial<z.infer<typeof zBlock>>
  } catch (error) {
    console.error("Failed to parse JSON:", error)
    return []
  }
}
