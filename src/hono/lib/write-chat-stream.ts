import { createOpenAI } from "@ai-sdk/openai"
import type { CoreMessage, DataStreamWriter } from "ai"
import { createChatStream } from "~/hono/lib/streams/create-chat-stream"
import { createContext } from "~/hono/lib/streams/create-context"
import { createShadcnuiCodeStream } from "~/hono/lib/streams/create-shadcnui-code-stream"
import { createShadcnuiDepsStream } from "~/hono/lib/streams/create-shadcnui-deps-stream"
import { createTasks } from "~/hono/lib/streams/create-tasks"

type Props = {
  apiKey: string
  template: string
  files: Record<string, string>
  messages: CoreMessage[]
  onMessage(message: CoreMessage): void
}

export async function writeChatStream(stream: DataStreamWriter, props: Props) {
  const provider = createOpenAI({ apiKey: props.apiKey })

  stream.writeMessageAnnotation("context-in-progress")

  /**
   * ユーザの目的を解析する
   */
  const context = await createContext({
    provider: provider,
    messages: props.messages,
  })

  console.log("context.object", context.object)

  if (context.object.context === "chat_only") {
    const contextStream = await createChatStream({
      provider: provider,
      messages: props.messages,
    })

    contextStream.mergeIntoDataStream(stream)
  }

  if (context.object.context === "edit_files") {
    stream.writeMessageAnnotation("context-in-tasks")

    /**
     * 要件を定義する
     */
    const tasks = await createTasks({
      provider: provider,
      messages: props.messages,
    })

    stream.writeMessageAnnotation("context-in-deps")

    console.log("tasks.object", tasks.object)

    /**
     * コンポーネントを選ぶ
     */
    const deps = await createShadcnuiDepsStream({
      provider: provider,
      messages: props.messages,
      tasks: tasks.object.functions,
    })

    stream.writeMessageAnnotation("context-in-code")

    console.log("deps.object", deps.object)

    /**
     * ファイルを編集する
     */
    const codeStream = await createShadcnuiCodeStream({
      provider: provider,
      messages: props.messages,
      code: props.files["src/app.tsx"],
      targetFiles: deps.object.components,
      tasks: tasks.object.functions,
    })

    codeStream.mergeIntoDataStream(stream)
  }
}
