import type { OpenAIProvider } from "@ai-sdk/openai"
import { type CoreMessage, generateObject } from "ai"
import { z } from "zod"
import { chatPrompt } from "~/hono/lib/prompts/chat-prompt"

const prompt = `ユーザの要望を元に、1つのページに含めるUIを4個以内で箇条書きで日本語で書き出しなさい。
実装するの1ページのみであり、多目的にならないようにしてください。

- 入力の指示がなければ基本的に閲覧を目的とする
- 入力が目的の場合は入力に関する機能を含める
- 閲覧が目的の場合は入力に関する機能を含めない`

type Props = {
  provider: OpenAIProvider
  messages: CoreMessage[]
}

export async function createTasks(props: Props) {
  return generateObject({
    model: props.provider.languageModel("gpt-4o"),
    schema: z.object({
      functions: z.array(z.string()),
    }),
    maxTokens: 2048,
    messages: [
      { role: "system", content: prompt },
      { role: "system", content: chatPrompt },
      ...props.messages,
    ],
  })
}
