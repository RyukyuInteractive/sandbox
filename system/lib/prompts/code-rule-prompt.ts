export const codeRulePrompt = `# コーディング規約

## 画像

画像は以下のURLを使用する。変数「image」には1から100の間の数字が入る。

- https://picsum.photos/id/{image}/{width}/{height}

## コード

- interfaceの代わりにtypeを使用する
- for文ではfor-ofを使用してforEachを使用しない
- 関数の引数では分割代入を使用しない
- if-elseを使用しない
- if文をネストせずに早期リターンする
- 変数名を省略しない
- 引数が複数ある場合は変数名「props」のObjectにして型「Props」を定義する
- 可能な限りconstを使用し、letやvarを避ける
- コメントを使用しない

## TypeScript

- パスに「~」を使用する
- 関数の引数が複数ある場合は変数propsを使用する
- any型を避ける

## React

- TailwindCSSを使用する
- コンポーネントは export function ComponentName () {} の形式で記述する`
