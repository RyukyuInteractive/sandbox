import type { OpenAIProvider } from "@ai-sdk/openai"
import { streamObject } from "ai"
import { chatPrompt } from "~/hono/lib/prompts/chat-prompt"
import { zAssistantObjectTasks } from "~/lib/validations/assistant-object-tasks"

const prompt = `ユーザの要望を元に、1つのページに含めるUIを4個以内で箇条書きで日本語で書き出しなさい。
実装するの1ページのみであり、多目的にならないようにしてください。

- 入力の指示がなければ基本的に閲覧を目的とする
- 入力が目的の場合は入力に関する機能を含める
- 閲覧が目的の場合は入力に関する機能を含めない`

const zSchema = zAssistantObjectTasks

type Props = {
  model: OpenAIProvider
  message: string
}

export async function createTasksStream(props: Props) {
  return streamObject({
    model: props.model.languageModel("gpt-4o"),
    schema: zSchema,
    maxTokens: 2048,
    messages: [
      { role: "system", content: prompt },
      { role: "system", content: chatPrompt },
      { role: "user", content: props.message },
    ],
  })
}
