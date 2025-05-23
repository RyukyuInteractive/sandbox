# AIコード生成

ユーザーがAIアシスタントを使用してコードを生成・編集するユースケースです。

1. ユーザーがAIチャットインターフェースを開く
2. ユーザーがコード生成に関する要求を入力する
    例: 「Reactでカウンターコンポーネントを作成して」
3. システムがユーザーの要求をAIモデルに送信する
4. AIモデルが要求を処理し、コードを生成する
5. システムが生成されたコードをチャットインターフェースに表示する
6. ユーザーが生成されたコードを確認する
    If (ユーザーが修正を要求する) Then
      ユーザーが追加の指示を入力する
      通常フローの3に戻る
    EndIf
7. ユーザーがコードをプロジェクトに適用するオプションを選択する
8. システムが適切なファイルパスを提案する
9. ユーザーがファイルパスを確認または修正する
10. システムが生成されたコードを指定されたパスに保存する
    If (保存に失敗した) Then
      システムがエラーメッセージを表示する
      ユーザーが別のパスを指定するオプションを提供する
    EndIf
11. システムが保存成功を通知する

## 代替フロー

### 既存コードの編集
2a. ユーザーが既存コードの編集を要求する
2b. ユーザーが編集対象のコードを提示する
2c. ユーザーが編集内容を指示する
2d. 通常フローの3に戻る

### コードの説明要求
2a. ユーザーがコードの説明を要求する
2b. ユーザーが説明対象のコードを提示する
2c. AIモデルがコードの説明を生成する
2d. システムが説明をチャットインターフェースに表示する

### バグ修正要求
2a. ユーザーがバグ修正を要求する
2b. ユーザーがバグのあるコードとエラー内容を提示する
2c. AIモデルが修正案を生成する
2d. 通常フローの5に戻る

### コード最適化要求
2a. ユーザーがコード最適化を要求する
2b. ユーザーが最適化対象のコードを提示する
2c. AIモデルが最適化されたコードを生成する
2d. 通常フローの5に戻る

## 事後条件
- 生成されたコードがチャットインターフェースに表示される
- ユーザーの選択に応じて、コードがプロジェクトファイルに保存される
- チャット履歴に会話とコード生成の記録が残る
