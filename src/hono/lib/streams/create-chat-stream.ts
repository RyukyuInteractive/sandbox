import type { OpenAIProvider } from "@ai-sdk/openai"
import { streamObject } from "ai"
import { chatPrompt } from "~/hono/lib/prompts/chat-prompt"
import { zAssistantObjectChat } from "~/lib/validations/assistant-object-chat"

const prompt = "あなたは開発者です。ユーザの技術的な質問に答えなさい。"

const zSchema = zAssistantObjectChat

type Props = {
  model: OpenAIProvider
  message: string
}

export async function createChatStream(props: Props) {
  return streamObject({
    model: props.model.languageModel("gpt-4o-mini"),
    schema: zSchema,
    maxTokens: 2048,
    messages: [
      { role: "system", content: prompt },
      { role: "system", content: chatPrompt },
      { role: "user", content: props.message },
    ],
  })
}
