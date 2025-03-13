import { createAnthropic } from "@ai-sdk/anthropic"
import type { DataStreamWriter, Message } from "ai"
import { appendResponseMessages, streamText, wrapLanguageModel } from "ai"
import { messageStorage } from "~/lib/message-storage"
import { executeCommandTool } from "~/lib/tools/execute-command-tool"
import { listFilesTool } from "~/lib/tools/list-files-tool"
import { readFileTool } from "~/lib/tools/read-file-tool"
import { searchFilesTool } from "~/lib/tools/search-files-tool"
import { thinkingTool } from "~/lib/tools/think-tool"
import { writeFileTool } from "~/lib/tools/write-file-tool"
import { chatPrompt } from "~/system/lib/prompts/chat-prompt"
import { codeRulePrompt } from "~/system/lib/prompts/code-rule-prompt"
import { cacheMiddleware } from "~/system/middlewares/cache-middleware"

const prompt = `あなたはファイルを読み書きしてWebサイトを開発する開発アシスタントです。
ユーザーの要件に基づいて、仮想ファイルシステムを自由に操作してWebサイトやアプリケーションを構築します。

あと「shadcn/ui」コンポーネントを活用できます。

## 応答ルール

- 必ずファイルを読み書きする
- マークダウンやアスタリスクを使用しない

## ファイルのルール

- ディレクトリ「src/components/ui」のファイルは書き換えてはならない

## ツール

あなたは以下のツールを使用して仮想のファイルシステムを操作できる。

- read_file: ファイルの内容を読み取る
- search_files: ファイル内を検索
- list_files: ディレクトリ内のファイル一覧を取得
- execute_command: シェルコマンドを実行

### execute_command

実行できるコマンドは「npm i」のみです。

- npm i <package>

### パッケージを追加する

パッケージを追加する場合はファイル「package.json」を確認しパッケージがインストールされていない場合は「npm install」する。

npm i <package>

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

- TailwindCSSのみを使用してレスポンシブレイアウトを構築
- アクセシビリティに配慮する

3. コード品質:

- コンポーネントの再利用を最大化
- パフォーマンスを考慮したコード設計
- モバイルファーストの考え方でUI設計`

type Props = {
  id: string
  apiKey: string
  template: string
  files: Record<string, string>
  messages: Message[]
  onMessage(message: Message): void
}

export async function writeChatStream(stream: DataStreamWriter, props: Props) {
  const provider = createAnthropic({
    apiKey: props.apiKey,
    generateId() {
      return crypto.randomUUID()
    },
    headers: {
      "anthropic-dangerous-direct-browser-access": "true",
    },
  })

  stream.writeMessageAnnotation("context-in-code")

  const agentStream = streamText({
    toolCallStreaming: true,
    model: wrapLanguageModel({
      model: provider.languageModel("claude-3-7-sonnet-20250219"),
      middleware: cacheMiddleware,
    }),
    /**
     * TODO: experimental_outputを使用するとtoolsが機能しなくなる？
     */
    // experimental_output: Output.object({ schema: zPart }),
    maxSteps: 64,
    tools: {
      thinking: thinkingTool(),
      write_to_file: writeFileTool(),
      read_file: readFileTool(),
      search_files: searchFilesTool(),
      list_files: listFilesTool(),
      execute_command: executeCommandTool(),
      // delete_file: deleteFileTool(),
      // list_code_definition_names: listCodeDefinitionNamesTool(),
      // ask_followup_question: askFollowupQuestionTool(),
    },
    messages: [
      { role: "system", content: prompt },
      { role: "system", content: chatPrompt },
      { role: "system", content: codeRulePrompt },
      ...props.messages,
    ],
    experimental_generateMessageId() {
      return crypto.randomUUID()
    },
    async onFinish({ response }) {
      await messageStorage.set(
        props.id,
        appendResponseMessages({
          messages: props.messages,
          responseMessages: response.messages,
        }),
      )
    },
  })

  agentStream.mergeIntoDataStream(stream)
}
