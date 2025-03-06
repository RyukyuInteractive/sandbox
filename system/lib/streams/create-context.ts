import type { OpenAIProvider } from "@ai-sdk/openai"
import { type CoreMessage, generateObject } from "ai"
import { z } from "zod"

const prompt = `ユーザが何を求めているか判定しなさい。

プロパティ「context」の値は以下のいずれかとなります。

- edit_files: 開発に関する要望
- chat_only: チャットのみ`

type Props = {
  provider: OpenAIProvider
  messages: CoreMessage[]
}

export async function createContext(props: Props) {
  return generateObject({
    model: props.provider.languageModel("gpt-4o-mini"),
    maxTokens: 128,
    schema: z.object({ context: z.string() }),
    messages: [{ role: "system", content: prompt }, ...props.messages],
  })
}
