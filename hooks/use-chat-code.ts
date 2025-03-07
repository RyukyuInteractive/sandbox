import type { UseChatHelpers } from "@ai-sdk/react"
import { useEffect, useRef } from "react"
import { toCodeBlock } from "~/lib/ai/to-code-block"

/**
 * @deprecated
 *  useChatCode(chat, async (path, content) => {
 *    if (editorRef.current === null) return
 *    if (currentFilePath !== path) {
 *      stateRef.current.currentFilePath = path
 *      setCurrentFilePath(path)
 *    }
 *    stateRef.current.files[path] = content ?? ""
 *    editorRef.current.setValue(content ?? "")
 * })
 */
export function useChatCode(
  chat: UseChatHelpers,
  onChange: (path: string, content: string) => void,
) {
  const ref = useRef<string | null>(null)

  useEffect(() => {
    if (chat.status !== "streaming") return

    const blocks = chat.messages
      .map((message) => toCodeBlock(message))
      .filter((n) => n !== null)

    const [latestBlock = null] = blocks

    if (latestBlock === null) return

    if (latestBlock.content === undefined) return

    if (latestBlock.path === undefined) return

    // 前回と同じコードなら更新しない
    if (ref.current === latestBlock) return

    ref.current = latestBlock.content

    onChange(latestBlock.path, latestBlock.content)
  }, [chat, onChange, chat.messages])
}
