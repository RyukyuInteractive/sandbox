import { createOpenAI } from "@ai-sdk/openai"
import type { StreamingApi } from "hono/utils/stream"
import type { z } from "zod"
import { createMessageObject } from "~/hono/lib/create-message-object"
import { createChatStream } from "~/hono/lib/streams/create-chat-stream"
import { createContextStream } from "~/hono/lib/streams/create-context-stream"
import { createShadcnuiCodeStream } from "~/hono/lib/streams/create-shadcnui-code-stream"
import { createShadcnuiDepsStream } from "~/hono/lib/streams/create-shadcnui-deps-stream"
import { createTasksStream } from "~/hono/lib/streams/create-tasks-stream"
import type { zUserMessage } from "~/lib/validations/user-message"
import type { ChatMessage } from "~/types/chat-message"

type Props = {
  apiKey: string
  template: string
  files: Record<string, string>
  messages: ChatMessage[]
  userMessage: z.infer<typeof zUserMessage>
  onMessage(message: ChatMessage): void
}

export async function writeChatStream(stream: StreamingApi, props: Props) {
  const model = createOpenAI({ apiKey: props.apiKey })

  stream.writeln("[")

  /**
   * ユーザの目的を解析する
   */
  const contextStream = await createContextStream({
    model,
    message: props.userMessage.content,
  })

  const contextMessage = await createMessageObject(
    stream,
    "context",
    contextStream,
  )

  props.onMessage(contextMessage)

  if (contextMessage.content.context === "chat_only") {
    const contextStream = await createChatStream({
      model,
      message: props.userMessage.content,
    })

    const message = await createMessageObject(stream, "chat", contextStream)

    props.onMessage(message)
  }

  if (contextMessage.content.context === "edit_files") {
    /**
     * 要件を定義する
     */
    const tasksStream = await createTasksStream({
      model,
      message: props.userMessage.content,
    })

    const tasksMessage = await createMessageObject(stream, "tasks", tasksStream)

    props.onMessage(tasksMessage)

    /**
     * コンポーネントを選ぶ
     */
    const depsStream = await createShadcnuiDepsStream({
      model: model,
      message: props.userMessage.content,
      tasks: tasksMessage.content.functions,
    })

    const depsMessage = await createMessageObject(stream, "deps", depsStream)

    props.onMessage(depsMessage)

    /**
     * ファイルを編集する
     */
    const codeStream = await createShadcnuiCodeStream({
      model: model,
      message: props.userMessage.content,
      code: props.files["src/app.tsx"],
      targetFiles: depsMessage.content.components,
      tasks: tasksMessage.content.functions,
    })

    const codeMessage = await createMessageObject(stream, "code", codeStream)

    props.onMessage(codeMessage)
  }

  stream.writeln("]")
}
