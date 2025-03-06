import type { UseChatHelpers } from "@ai-sdk/react"
import { useEffect } from "react"
import { toMessageCode } from "~/lib/to-message-code"

export function useChatCode(
  chat: UseChatHelpers,
  onChange: (code: string) => void,
) {
  useEffect(() => {
    if (chat.status !== "streaming") return

    const [code = null] = chat.messages
      .map((message) => toMessageCode(message))
      .filter((n) => n !== null)

    if (code === null) return

    onChange(code)
  }, [chat, onChange])
}
