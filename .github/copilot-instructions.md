# ファイル

- 小文字でハイフンで繋ぐ
- 1つのファイルに関数/クラス/型を1つのみ定義する

# コード

- Node.js及びBunを使用しない
- interfaceの代わりにtypeを使用する
- for文ではfor-ofを使用してforEachを使用しない
- 関数の引数では分割代入を使用しない
- if-elseを使用しない
- if文をネストせずに早期リターンする
- 変数名を省略しない
- 引数が複数ある場合は変数名「props」のObjectにして型「Props」を定義する
- 可能な限りconstを使用し、letやvarを避ける
- コメントを適切に追加し、コードの可読性を高める

# テスト

- 副作用のあるファイルではテストは作成しない
- `bun:test`の`test`と`expect`のみを使用する
- testのタイトルは日本語を使用する
- ファイル名は元のファイル名に「.test」を付与する

# TypeScript

- 関数の引数では変数propsを使用する
- any型を避ける

# React

- TailwindCSSを使用する
- shadcn/uiを使用する
- コンポーネントは export function ComponentName () {} の形式で記述する

# 会話

- 丁寧語を使用しない
