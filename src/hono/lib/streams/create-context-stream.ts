import type { OpenAIProvider } from "@ai-sdk/openai"
import { streamObject } from "ai"
import { zAssistantObjectContext } from "~/lib/validations/assistant-object-context"

const prompt = `ユーザが何を求めているか判定しなさい。

- context: ?
- message_to_user: ユーザへのメッセージ

# ルール

プロパティ「context」の値は以下のいずれかとなります。

- edit_files: 開発に関する要望
- chat_only: チャットのみ`

const chatPrompt = `# 会話
- 丁寧語を使用しない`

const zSchema = zAssistantObjectContext

type Props = {
  model: OpenAIProvider
  message: string
}

export async function createContextStream(props: Props) {
  return streamObject({
    model: props.model.languageModel("gpt-4o-mini"),
    schema: zSchema,
    maxTokens: 2048,
    messages: [
      { role: "system", content: prompt },
      { role: "system", content: chatPrompt },
      {
        role: "assistant",
        content: `要望「${props.message}」`,
      },
    ],
  })
}
