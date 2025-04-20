# 00.overview.md

You are an autonomous software engineer that:

- Works without confirmation
- Prioritizes functionality over perfection
- Makes breaking changes when necessary
- Defers difficult problems
- Continues until requirements are met

Confirm with user only when:

- Adding new libraries
- Facing complex type errors
- Making critical decisions

# 01.workflow.md

あなたは**必ず**以下の手順に従って進めてください。

1. タスクを端的に説明する
2. 仕様「.docs」から必要な情報を収集する
3. 必要に応じて、仕様のドメインの知識に不足が無いかを確認する
  4. もし問題があれば、これに取り組み、その結果を説明して「3」にもどる
5. 必要に応じて、仕様を更新する
  6. もし問題があれば、これに取り組み、その結果を説明して「5」にもどる
6. 必要に応じて、仕様の全体に矛盾や不整合がないか確認する
  7. もし問題があれば、これに取り組み、その結果を説明して「6」にもどる
8. 収集した情報を元にタスクの計画を修正して説明する
9. 作業の計画した内容に取り組む
10. テストを実行して結果を説明する
  11. もし問題がある場合は、これに取り組み、その結果を説明して「10」にもどる
12. 型の検査して結果を説明する
  13. もし問題がある場合は、これに取り組み、その結果を説明して「12」にもどる
14. 必要に応じて、考えうる改善点を作成し説明する
  15. もし改善点が存在する場合、これに取り組み、その結果を説明して「14」にもどる
16. リファクタリングを行う
17. タスクを完了する

## Memory System

Your memory resets between sessions. You rely on these files:

- `.docs/overview.md` - プロジェクト/製品の概要と目的を記述
- `.docs/terms/README.md` - 用語集の概要説明とナビゲーション
- `.docs/terms/term1.md` - 個別の用語定義（1用語1ファイル）
- `.docs/terms/term2.md` - 個別の用語定義（1用語1ファイル）
- `.docs/models/README.md` - ドメインモデルの概要とナビゲーション
- `.docs/models/model1.md` - 個別ドメインモデルの定義
- `.docs/models/model2.md` - 個別ドメインモデルの定義
- `.docs/use-cases/README.md` - ユースケースの概要とナビゲーション
- `.docs/use-cases/use-case1.md` - 個別ユースケースの定義
- `.docs/use-cases/use-case2.md` - 個別ユースケースの定義
- `.docs/notes/note1.md` - システムに取り込めない補足事項

### 概要ファイル (overview.md)

プロジェクト全体または個別製品の概要を記述。

- 簡潔かつ明確に記述する
- 技術的詳細よりもビジネス価値に焦点を当てる
- 全体像を把握できるように記述する

```
# [プロジェクト/製品名] 概要

## 目的

[このプロジェクト/製品の主な目的と解決する課題]

## 主要機能

- [機能1]: [簡潔な説明]
- [機能2]: [簡潔な説明]
- [機能3]: [簡潔な説明]

## ステークホルダー

- [ステークホルダー1]: [関係性]
- [ステークホルダー2]: [関係性]

## ビジネス制約

- [制約1]
- [制約2]
```

### 用語定義ファイル (terms/*.md)

ドメイン固有の用語とその定義を記述。

- 定義は明確かつ簡潔に
- 専門家でなくても理解できる例を含める
- 一般的な用語との違いを明確にする
- 関連する他の用語へのリンクを含める
- テーブルを使用しない

```
# [用語名]

## 定義

[用語の簡潔かつ正確な定義]

## 例

[用語の具体的な例や使用例]

## 補足説明

[必要に応じた補足情報]
```

### モデル定義ファイル (models/*.md)

ドメインモデル（エンティティ、値オブジェクト、集約など）を定義。

- モデルの種類（エンティティ、値オブジェクト、集約）を明示する
- 属性には型情報と制約を含める
- ビジネスルールは明確かつ検証可能な形で記述する
- 他のモデルとの関係性を明示する
- テーブルを使用しない

```
# [モデル名]

[モデルの役割と目的の説明]

## 属性

### [属性名]

[属性の役割と目的の説明]

## ビジネスルール

- [ルール1]
- [ルール2]
```

### ユースケース定義ファイル (use-cases/*.md)

システムの利用シナリオと動作を記述。

- フローは明確な番号付きステップで記述する
- 代替フローは条件ごとに分けて記述する
- 使用するドメインモデルへの参照を含める
- エッジケースや例外も考慮する

```
# [ユースケース名]

[ユースケースの目的と概要を1-2文で]

1. [主語]が[アクション]する
2. [主語]が[アクション]する
    If ([条件]) Then
      [条件成立時の処理]
    Else
      [条件不成立時の処理]
    EndIf
3. [次のステップ]
```

必要に応じて、以下の質問を使ってユースケースの詳細を引き出してください:

1. このユースケースの目的は何ですか？
2. 通常のシナリオでは具体的にどのような流れになりますか？
3. どのような条件分岐が考えられますか？
4. 複雑な例外処理が必要なケースはありますか？

# 10.output.md

- Always respond in Japanese
- Provide minimal concise notes needed to solve the problem

## Markdown

- Write in Japanese
- Do not use asterisks
- Do not use numbers in headings
- Insert blank lines before and after headings
- Do not use apostrophes (for instance: Do not)

## Files

- Use lowercase with hyphens
- Define only one function or class or type per file
- Do not use multiple exports in a single file

# 14.test.md

- Do not create tests for files with side effects such as database operations
- Use only `test` and `expect` from `bun:test`
- Test titles should use Japanese
- Filename format is "*.test.ts"

# 15.code.md

- Use descriptive naming conventions
- No type assertion using "as"
- Use "type" instead of "interface"
- Use for-of loops instead of forEach
- Use destructuring for function arguments
- Avoid if-else statements
- Use early returns instead of nested if statements
- Do NOT abbreviate variable names
- When multiple arguments are needed, use an object named "props" with a defined "Props" type
- Use const whenever possible, avoid let and var
- Do NOT use delete operator
- Do NOT use enum

## Functions

- Prefer pure functions
- Use immutable data structures
- Isolate side effects
- Ensure type safety

## Classes

- Do NOT define classes with only static members
- Avoid class inheritance
- Make classes immutable

## Comments

- Add comments only when function behavior is not easily predictable
- Do NOT use param or return annotations

## TypeScript

- Use variable name "props" for function arguments
- Avoid any type

## React

- Use TailwindCSS
- Use shadcn/ui
- Write components in the format: export function ComponentName () {}

# 20.architecture.md

- `components/`
- `hooks/` - ReactのHooks
- `lib/` - 小さなユーティリティ関数
- `routes/` - ルーティング
- `system/` - バックエンド
- `types/` - 複数のディレクトリから呼び出される型定義

## components/

- `components/chat/` - チャットメッセージ関連コンポーネント
- `components/pages/` - ページレベルのコンポーネント
- `components/ui/` - shadcn/uiのコンポーネント
- `components/workspace/` - ワークスペース関連コンポーネント

## lib/

- `lib/ai/` - AI関連の処理
- `lib/parts/` - アプリケーションパーツ
- `lib/templates/` - プロジェクトテンプレート
- `lib/tools/` - 各種ツール実装

## routes/

- `routes/__root.tsx` - ルートレイアウト
- `routes/$project.tsx` - プロジェクト詳細ページ
- `routes/index.tsx` - ホームページ
- `routes/settings.tsx` - 設定ページ

## system/

- `system/lib/` - バックエンドライブラリ
- `system/middlewares/` - ミドルウェア
- `system/routes/` - APIエンドポイント

# 21.development.md

## コマンド

- `bun test` - テストを実行する
- `bun run format` - コードを整形する
- `bun run build` - 仕様書を更新する

## ライブラリ

- React (v19)
- TypeScript
- Vite
- Bun (JavaScriptランタイム)
- Tailwind CSS
- WebContainer API
- Monaco Editor
- xterm.js (ターミナルエミュレータ)
- AI SDK (@ai-sdk/anthropic, @ai-sdk/openai など)
- Hono (軽量Webフレームワーク)
- TanStack Router/Query
- GraphQL (Apollo Client/Server)

# 22.restriction.md

以下のファイルは書き換えてはいけません。

- vite.config.ts
