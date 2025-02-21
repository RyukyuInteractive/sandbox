import type { OpenAIProvider } from "@ai-sdk/openai"
import { streamObject } from "ai"
import { shadcnuiFiles } from "~/hono/lib/files/shadcnui-files"
import { codeRulePrompt } from "~/hono/lib/prompts/code-rule-prompt"
import { zAssistantObjectShadcnuiCode } from "~/lib/validations/assistant-object-shadcnui-code"

const prompt = `あなたはプログラマーです。ファイル「src/app.tsx」を修正しなさい。

## 画像

画像は以下のURLを使用する。変数「image」には1から100の間の数字が入る。

- https://picsum.photos/id/{image}/{width}/{height}

## ルール

- ダークモードなので白色を使用しない。
- 絶対に背景色を変えない。（bg-を使用しない）
- TailwindCSSを用いてレイアウトを作成する

必要に応じて以下のコンポーネントをimportして使用できます。その他のファイルはimportできません。`

const chatPrompt = `# 会話
- 丁寧語を使用しない`

const zSchema = zAssistantObjectShadcnuiCode

type Props = {
  model: OpenAIProvider
  message: string
  code: string
  targetFiles: string[]
  tasks: string[]
}

export async function createShadcnuiCodeStream(props: Props) {
  const files: Record<string, string> = {
    "src/app.tsx": props.code,
  }

  for (const targetFile of props.targetFiles) {
    const path = targetFile.replace("src", "~")
    files[path] = shadcnuiFiles[targetFile]
  }

  console.log("files", files)

  const tasksText = props.tasks.map((task) => `- ${task}`).join("\n")

  return streamObject({
    model: props.model.languageModel("gpt-4o"),
    schema: zSchema,
    maxTokens: 2048,
    messages: [
      { role: "system", content: prompt },
      { role: "system", content: JSON.stringify(files) },
      { role: "system", content: chatPrompt },
      { role: "system", content: codeRulePrompt },
      {
        role: "system",
        content: `# 要件\n${tasksText}`,
      },
      {
        role: "system",
        content: `要望「${props.message}」を満たすようにファイル「src/app.tsx」を修正しなさい。`,
      },
    ],
  })
}
