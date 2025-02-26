import type { OpenAIProvider } from "@ai-sdk/openai"
import { type CoreMessage, generateObject } from "ai"
import { z } from "zod"

const prompt = `ユーザの要望に基づき、1つのページに含めるUI要素の追加の実装を8個以内で箇条書きで日本語で書き出してください。

実装するのは1ページのみです。

- 入力の指示がなければ、基本的に閲覧を目的とする
- 入力が目的の場合は、入力に関する機能を含める
- 閲覧が目的の場合は、入力に関する機能を含めない
- ユーザビリティを考慮し、シンプルで直感的なデザインにする
- 各UI要素の具体的な機能や役割を明確にする`

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
    messages: [{ role: "system", content: prompt }, ...props.messages],
  })
}
