import type { Message, UIMessage } from "ai"
import { toMessageBlocks } from "~/lib/ai/to-message-blocks"

/**
 * @deprecated
 */
export function toWebContainerActions(message: UIMessage | Message) {
  const allBlocks = toMessageBlocks(message)

  // console.log("allBlocks", allBlocks)

  const blocks = allBlocks.map((block) => {
    if (block === undefined) return null

    if (block.type !== "file") return null

    return block
  })

  // console.log("codeBlocks", blocks)

  return blocks.filter((block) => block !== null)
}
