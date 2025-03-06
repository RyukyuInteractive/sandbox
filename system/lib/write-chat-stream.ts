import { createOpenAI } from "@ai-sdk/openai"
import type { CoreMessage, DataStreamWriter } from "ai"
import { createChatStream } from "~/system/lib/streams/create-chat-stream"
import { createContext } from "~/system/lib/streams/create-context"
import { createShadcnuiCodeStream } from "~/system/lib/streams/create-shadcnui-code-stream"
import { createTasks } from "~/system/lib/streams/create-tasks"

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

    console.log("tasks.object", tasks.object)

    stream.writeMessageAnnotation("context-in-code")

    /**
     * ファイルを編集する
     */
    const codeStream = await createShadcnuiCodeStream({
      provider: provider,
      messages: props.messages,
      code: props.files["src/app.tsx"],
      files: props.files,
      tasks: tasks.object.functions,
    })

    codeStream.mergeIntoDataStream(stream)
  }
}
