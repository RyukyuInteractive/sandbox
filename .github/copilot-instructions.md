# プロジェクト

ブラウザ上で要件を入力しWebサイトを作ることができるサイトです。
生成AIを用いたAIエージェントがコードを生成し応答し同時にコードをプレビューできるサイトです。以下の機能があります。

- 仮想のファイルシステム
- ファイルのプリセット
- WebContainersを用いたプレビュー

しかしブラウザで動作する仕組みなのでデータベースなどバックエンドは構築できません。

# 構成

製品はブラウザ上のみで動作する仕組みで、ログインやデータベースといったバックエンドは存在しません。ただ、Honoをブラウザ上で動かしており、コード生成に使用するAPIキーはユーザが入力しローカルストレージに書き込まれます。

Node.jsを使用することはできません。Webcontainersを用いてNode.jsのサンドボックスを作成し、ブラウザ上で動作します。

### ディレクトリ構成

- `components/` - Reactのコンポーネント
- `components/chat` - チャットのメッセージに関係
- `components/pages` - ページに関係
- `components/ui` - UIライブラリ（shadcn/ui）
- `system/lib/files` - コード生成に関するファイルのプリセット
- `system/lib/prompts` - AIエージェントのプロンプト
- `system/lib/streams` - AIエージェントのAPIの実行に関する処理
- `system/lib/routes` - ブラウザ上で動作するHonoのエンドポイント
- `system/lib/write-chat-stream.ts` - コード生成などStreamを読み書きする
- `system/factory` - Honoのfactory
- `system/factory` - Honoのfactory
- `system/index.ts` - Honoのエントリーポイント
- `hooks` - ReactのHooks
- `lib/client.ts` - Honoのクライアント
- `routes` - ページ
- `routes/index.tsx` - メインの画面

### ライブラリ

- `zod` - バリデーション
- `monaco-editor-core` - コードエディタのUIライブラリ
- `ai` - LLMの処理に関連
- `@tanstack/react-query` - 非同期処理の状態管理
- `@tanstack/react-router` - ルーティング
- `lucide-react` - アイコン
- `@webcontainer/api` - ブラウザ上でNode.jsのサンドボックス

### 開発ケース

#### AIエージェントの機能を修正する

1. `system/lib/write-chat-stream/*.ts` - Streamの処理
1. `components/workspace/workspace.tsx` - 画面

#### APIにQueryを追加する

データを更新する機能を追加する場合、以下のファイルを読み書きしてください。

1. `api/interface/query-fields/*.ts` - GraphQLのQuery
1. `api/interface/objects/*-node.ts` - GraphQLのNode
1. `api/interface/schema.ts` - GraphQLのスキーマ

# サンプルコード

## components/*/*.tsx

- 型をPropsとして定義する
- 引数はprops:Propsとする

```ts
type Props = {
  message: UIMessage
}

export function Component(props: Props) {
  return <div />
}
```

## 関数 *.ts

- const { a } = props のような分割代入をしない
- props: Props = {} のようなデフォルト値を設定しない
- オブジェクトの型名はなら必ずPropsにする

```ts
type Props = {
  message: UIMessage
}

export function Component(props: Props) {
  return <div />
}
```

## system/lib/tools/*.ts

- 必ず`tool`関数の戻り値を返す

```ts
import { tool } from "ai"
import { z } from "zod"

type Props = {
  files: Record<string, string>
}

export function searchFilesTool(props: Props) {
  return tool({
    description:
      "正規表現でファイルを検索する（ファイルのパスの配列を受け取る）",
    parameters: z.object({
      regex: z.string(),
    }),
    async execute(args) {},
  })
}
```

# ファイル

- 小文字でハイフンで繋ぐ
- 1つのファイルに関数/クラス/型を1つのみ定義する

# テスト

- 副作用のあるファイルではテストは作成しない
- `bun:test`の`test`と`expect`のみを使用する
- testのタイトルは日本語を使用する
- ファイル名は「.test」

以下のディレクトリではテストを作成する

- **/domain/*.entity.ts
- **/domain/*.value.ts
- **/lib/*.ts

# コード規約

- Docコメントにはparamとreturnを含めず説明のみを記述
- ファイルをexportする為のindex.tsを作成しない
- Node.jsを使用しない
- 説明的な命名規則の採用
- as型アサーションの使用禁止
- interfaceの代わりにtypeを使用
- for文ではfor-ofを使用してforEachを使用しない
- 関数の引数では分割代入を使用しない
- if-elseを使用しない
- if文をネストせずに早期リターン
- 変数名を省略しない
- 引数が複数ある場合は変数名「props」のObjectにして型「Props」を定義
- 可能な限りconstを使用、letやvarを避ける
- コメントを適切に追加、コードの可読性を高める
- const {} = props のような分割代入は禁止

## 関数

- 純粋関数を優先
- 不変データ構造を使用
- 副作用を分離
- 型安全性を確保

## クラス

- Staticのみのクラスを定義しない
- クラスの継承を使用しない
- イミュータブル

## TypeScript

- 関数の引数では変数propsを使用する
- any型を避ける

## React

- TailwindCSSを使用する
- shadcn/uiを使用する
- コンポーネントは export function ComponentName () {} の形式で記述する

# 会話

- 日本語
- 語尾「ゆ🥹」
- 丁寧語でカジュアル
