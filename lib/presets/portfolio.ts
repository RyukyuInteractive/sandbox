import type { Preset } from "./types"

export const portfolioPreset: Preset = {
  id: "portfolio",
  name: "ポートフォリオ",
  description: "あなたのプロジェクトや作品を紹介するためのポートフォリオテンプレート",
  files: {}
}


portfolioPreset.files["package.json"] = JSON.stringify(
  {
    name: "portfolio",
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

portfolioPreset.files["src/app.tsx"] = `import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

export function App() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-zinc-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">山田 太郎</h1>
              <p className="text-zinc-300 mt-1">Webデザイナー & フロントエンド開発者</p>
            </div>
            <nav className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li><a href="#about" className="hover:text-emerald-400 transition">自己紹介</a></li>
                <li><a href="#projects" className="hover:text-emerald-400 transition">プロジェクト</a></li>
                <li><a href="#contact" className="hover:text-emerald-400 transition">お問い合わせ</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section id="about" className="py-20 bg-white dark:bg-zinc-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">自己紹介</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="aspect-square bg-zinc-200 dark:bg-zinc-700 rounded-full max-w-xs mx-auto overflow-hidden">
                  <img 
                    src="https://source.unsplash.com/random/400x400?person" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">こんにちは、山田太郎です</h3>
                <p className="text-zinc-700 dark:text-zinc-300 mb-6">
                  5年以上のWeb開発経験を持つフロントエンド開発者です。
                  モダンなUIデザインと優れたユーザー体験の創出に情熱を持っています。
                  React、TypeScript、Tailwind CSSを使用した開発が得意で、
                  これまで様々な企業のWebアプリケーション開発に携わってきました。
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 px-3 py-1 rounded-full text-sm">JavaScript</span>
                  <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 px-3 py-1 rounded-full text-sm">TypeScript</span>
                  <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 px-3 py-1 rounded-full text-sm">React</span>
                  <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 px-3 py-1 rounded-full text-sm">Tailwind CSS</span>
                  <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 px-3 py-1 rounded-full text-sm">Figma</span>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">履歴書をダウンロード</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="py-20 bg-zinc-50 dark:bg-zinc-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">プロジェクト</h2>
            <p className="text-center text-zinc-700 dark:text-zinc-300 mb-12 max-w-2xl mx-auto">
              これまでに手がけた代表的なプロジェクトをご紹介します。
              それぞれのプロジェクトで異なる技術スタックと課題に取り組みました。
            </p>

            <Tabs defaultValue="all" className="w-full mb-12">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger value="web">Webサイト</TabsTrigger>
                <TabsTrigger value="app">アプリ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="overflow-hidden">
                    <img 
                      src="https://source.unsplash.com/random/400x300?website" 
                      alt="Project 1" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">コーポレートサイトリニューアル</h3>
                      <p className="text-zinc-700 dark:text-zinc-300 mb-4 text-sm">
                        大手製造業のコーポレートサイトをリニューアル。
                        レスポンシブデザインとパフォーマンス最適化を実施。
                      </p>
                      <div className="flex gap-2">
                        <span className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">React</span>
                        <span className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">Next.js</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <img 
                      src="https://source.unsplash.com/random/400x300?app" 
                      alt="Project 2" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">予約管理アプリ</h3>
                      <p className="text-zinc-700 dark:text-zinc-300 mb-4 text-sm">
                        飲食店向けの予約管理システム。
                        リアルタイム更新とカレンダー連携機能を実装。
                      </p>
                      <div className="flex gap-2">
                        <span className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">TypeScript</span>
                        <span className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">Firebase</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <img 
                      src="https://source.unsplash.com/random/400x300?dashboard" 
                      alt="Project 3" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">分析ダッシュボード</h3>
                      <p className="text-zinc-700 dark:text-zinc-300 mb-4 text-sm">
                        マーケティングデータを可視化するダッシュボード。
                        複雑なフィルタリングとグラフ表示機能を実装。
                      </p>
                      <div className="flex gap-2">
                        <span className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">React</span>
                        <span className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">D3.js</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="contact" className="py-20 bg-white dark:bg-zinc-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">お問い合わせ</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-8 max-w-2xl mx-auto">
              プロジェクトのご相談やお問い合わせは、以下のボタンからお気軽にどうぞ。
              通常2営業日以内にご返信いたします。
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700 px-8 py-6 text-lg">
              メッセージを送る
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 山田太郎. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}`
