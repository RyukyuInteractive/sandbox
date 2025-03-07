export const codeRulePrompt = `# ファイル

- 小文字でハイフンで繋ぐ
- 1つのファイルに関数/クラス/型を1つのみ定義する

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
- コンポーネントは export function ComponentName () {} の形式で記述する`
