import type { OpenAIProvider } from "@ai-sdk/openai"
import { type CoreMessage, Output, streamText, tool } from "ai"
import { z } from "zod"
import { zPartFile } from "~/lib/parts/part-file"
import { chatPrompt } from "~/system/lib/prompts/chat-prompt"
import { codeRulePrompt } from "~/system/lib/prompts/code-rule-prompt"

const prompt = `あなたは熟練したフロントエンドエンジニアです。ファイル「src/app.tsx」を指示に従って効率的に修正してください。

レスポンスフォーマット:
- type: "code"
- code: 修正後の最適化されたコード
- message_to_user: 変更点の簡潔な説明

## リソース

### 画像

- https://picsum.photos/id/{image}/{width}/{height}
- image: 1-100の整数
- width/height: 画像サイズ（ピクセル）

## デザイン要件

1. ダークモードに最適化:
- 白色を使用しない
- コントラスト比を適切に保つ
- 目に優しい色使いを心がける

2. レイアウト制約:
- 背景色の変更は厳禁 (bg-* クラスを使用しない)
- TailwindCSSのみを使用してレスポンシブレイアウトを構築
- アクセシビリティに配慮する

3. コード品質:
- コンポーネントの再利用を最大化
- パフォーマンスを考慮したコード設計
- モバイルファーストの考え方でUI設計

## 作業

指定されたコンポーネントのみをimportして使用できます。それ以外のファイルはimport禁止です。

コンポーネントを使用する際は中身を取得してください。`

type Props = {
  provider: OpenAIProvider
  messages: CoreMessage[]
  code: string
  files: Record<string, string>
  tasks: string[]
}

export async function createShadcnuiCodeStream(props: Props) {
  const files: Record<string, string> = {
    "src/app.tsx": props.files["src/app.tsx"],
    "src/components/input.tsx": props.files["src/components/input.tsx"],
    "src/components/button.tsx": props.files["src/components/button.tsx"],
    "src/components/card.tsx": props.files["src/components/card.tsx"],
  }

  const tasksText = props.tasks.map((task) => `- ${task}`).join("\n")

  const filesPrompt = Object.keys(props.files)
    .map((file) => `- ${file}`)
    .join("\n")

  return streamText({
    model: props.provider.languageModel("gpt-4o", {
      structuredOutputs: true,
    }),
    maxTokens: 2048,
    experimental_output: Output.object({ schema: zPartFile }),
    maxSteps: 16,
    tools: {
      read_file_content: tool({
        description: "ファイルの中身を取得する",
        parameters: z.object({ path: z.string() }),
        async execute(args) {
          const filePath = args.path.replace("~", "src")
          return {
            content: props.files[filePath] ?? "",
          }
        },
      }),
    },
    messages: [
      { role: "system", content: prompt },
      { role: "system", content: filesPrompt },
      { role: "system", content: JSON.stringify(files) },
      { role: "system", content: chatPrompt },
      { role: "system", content: codeRulePrompt },
      {
        role: "system",
        content: `# 要件\n${tasksText}`,
      },
      ...props.messages,
    ],
  })
}
