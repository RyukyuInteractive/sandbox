import type { Preset } from "./types"

export const blogPreset: Preset = {
  id: "blog",
  name: "ブログ",
  description: "記事投稿と表示のためのブログテンプレート",
  files: {},
}

blogPreset.files["package.json"] = JSON.stringify(
  {
    name: "blog",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
    },
    devDependencies: {
      "@tailwindcss/vite": "^4.0.6",
      "@types/react": "^19.0.8",
      "@types/react-dom": "^19.0.3",
      "@vitejs/plugin-react": "^4.3.2",
      tailwindcss: "^3.4.10",
      "tailwindcss-animate": "^1.0.7",
      typescript: "^5.7.3",
      vite: "^6.0.3",
      postcss: "^8.4.41",
    },
    dependencies: {
      "@hookform/resolvers": "^4.1.0",
      "@radix-ui/react-accordion": "^1.2.3",
      "@radix-ui/react-alert-dialog": "^1.1.6",
      "@radix-ui/react-aspect-ratio": "^1.1.2",
      "@radix-ui/react-avatar": "^1.1.3",
      "@radix-ui/react-checkbox": "^1.1.4",
      "@radix-ui/react-collapsible": "^1.1.3",
      "@radix-ui/react-context-menu": "^2.2.6",
      "@radix-ui/react-dialog": "^1.1.6",
      "@radix-ui/react-dropdown-menu": "^2.1.6",
      "@radix-ui/react-hover-card": "^1.1.6",
      "@radix-ui/react-label": "^2.1.2",
      "@radix-ui/react-menubar": "^1.1.6",
      "@radix-ui/react-navigation-menu": "^1.2.5",
      "@radix-ui/react-popover": "^1.1.6",
      "@radix-ui/react-progress": "^1.1.2",
      "@radix-ui/react-radio-group": "^1.2.3",
      "@radix-ui/react-scroll-area": "^1.2.3",
      "@radix-ui/react-select": "^2.1.6",
      "@radix-ui/react-separator": "^1.1.2",
      "@radix-ui/react-slider": "^1.2.3",
      "@radix-ui/react-slot": "^1.1.2",
      "@radix-ui/react-switch": "^1.1.3",
      "@radix-ui/react-tabs": "^1.1.3",
      "@radix-ui/react-toast": "^1.2.6",
      "@radix-ui/react-toggle": "^1.1.2",
      "@radix-ui/react-toggle-group": "^1.1.2",
      "@radix-ui/react-tooltip": "^1.1.8",
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      cmdk: "^1.0.0",
      "date-fns": "^3.6.0",
      "embla-carousel-react": "^8.5.2",
      "input-otp": "^1.4.2",
      "lucide-react": "^0.475.0",
      "next-themes": "^0.4.4",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      "react-hook-form": "^7.54.2",
      "react-resizable-panels": "^2.1.7",
      "react-day-picker": "^9.5.1",
      recharts: "^2.15.1",
      sonner: "^2.0.0",
      "tailwind-merge": "^3.0.1",
    },
  },
  null,
  2,
)

blogPreset.files["src/app.tsx"] =
  `import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"

export function App() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Blog</h1>
            <nav className="hidden md:flex space-x-4">
              <a href="#" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">ホーム</a>
              <a href="#" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">記事一覧</a>
              <a href="#" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">お問い合わせ</a>
            </nav>
            <Button variant="ghost">ログイン</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
              <img 
                src="https://source.unsplash.com/random/800x400?nature" 
                alt="Featured Article" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">2025年4月1日 • テクノロジー</p>
                <h2 className="text-2xl font-bold mt-2 mb-4">最新テクノロジートレンド2025</h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  今年注目すべきテクノロジートレンドについて解説します。AI、ブロックチェーン、量子コンピューティングなど、
                  ビジネスを変革する技術を詳しく見ていきましょう。
                </p>
                <Button variant="link" className="p-0">続きを読む</Button>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-6">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">2025年3月28日 • デザイン</p>
                <h2 className="text-2xl font-bold mt-2 mb-4">UIデザインのベストプラクティス</h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  効果的なUIデザインを作成するためのベストプラクティスを紹介します。ユーザー体験を向上させる
                  デザイン原則から実践的なテクニックまで、デザイナー必見の内容です。
                </p>
                <Button variant="link" className="p-0">続きを読む</Button>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">カテゴリー</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">テクノロジー (12)</a></li>
                <li><a href="#" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">デザイン (8)</a></li>
                <li><a href="#" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">ビジネス (6)</a></li>
                <li><a href="#" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">ライフスタイル (4)</a></li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">人気の記事</h3>
              <div className="space-y-4">
                <div>
                  <a href="#" className="font-medium text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white">
                    プログラミング初心者が1ヶ月で身につけるべきスキル
                  </a>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">2025年3月15日</p>
                </div>
                <Separator />
                <div>
                  <a href="#" className="font-medium text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white">
                    リモートワークで生産性を高める7つの方法
                  </a>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">2025年3月10日</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-12">
        <div className="container mx-auto py-8 px-4 text-center text-zinc-500 dark:text-zinc-400">
          <p>© 2025 My Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}`
