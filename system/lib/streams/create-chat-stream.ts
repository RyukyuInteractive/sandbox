import type { OpenAIProvider } from "@ai-sdk/openai"
import { type CoreMessage, Output, streamText } from "ai"
import { zPartMessage } from "~/lib/parts/part-message"
import { chatPrompt } from "~/system/lib/prompts/chat-prompt"

const prompt = "あなたは開発者です。ユーザの技術的な質問に答えなさい。"

type Props = {
  provider: OpenAIProvider
  messages: CoreMessage[]
}

export async function createChatStream(props: Props) {
  return streamText({
    model: props.provider.languageModel("gpt-4o", {
      structuredOutputs: true,
    }),
    maxTokens: 2048,
    experimental_output: Output.object({ schema: zPartMessage }),
    messages: [
      { role: "system", content: prompt },
      { role: "system", content: chatPrompt },
      ...props.messages,
    ],
  })
}
