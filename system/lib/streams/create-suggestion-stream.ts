import type { OpenAIProvider } from "@ai-sdk/openai"
import { streamObject } from "ai"
import { z } from "zod"

const prompt = "提案を作成してください。"

const zSchema = z.object({
  explanation: z.string(),
})

type Props = {
  model: OpenAIProvider
  message: string
  code: string
}

export async function createSuggestionStream(props: Props) {
  return streamObject({
    model: props.model.languageModel("gpt-4o-mini"),
    schema: zSchema,
    maxTokens: 2048,
    messages: [{ role: "system", content: prompt }],
  })
}
