# WebContainer

## 定義
WebContainerは、ブラウザ内でNode.jsアプリケーションを実行するための仮想環境です。サーバーサイドのコードをクライアントサイドで実行可能にする技術で、Sandboxの中核機能として利用されています。

## 例
ユーザーがReactアプリケーションを作成し、`npm run dev`コマンドを実行すると、WebContainer内でViteサーバーが起動し、ブラウザ上でアプリケーションのプレビューが表示されます。

## 補足説明
WebContainerは@webcontainer/apiライブラリを通じて実装されており、ファイルシステム、ネットワーク、プロセス管理などの機能を提供します。これにより、ローカル開発環境に近い体験をブラウザ内で実現しています。

## 関連用語
- [ワークスペース](./workspace.md): WebContainerを含む開発環境全体
- [ターミナル](./terminal.md): WebContainer内でコマンドを実行するためのインターフェース
