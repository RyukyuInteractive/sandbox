import type { Preset } from "./types"

export const landingPagePreset: Preset = {
  id: "landing-page",
  name: "ランディングページ",
  description: "商品やサービスを紹介するためのランディングページテンプレート",
  files: {},
}

landingPagePreset.files["package.json"] = JSON.stringify(
  {
    name: "landing-page",
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

landingPagePreset.files["src/app.tsx"] =
  `import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"

export function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">BrandName</h1>
          <nav className="hidden md:flex space-x-4">
            <a href="#features" className="text-zinc-300 hover:text-white">機能</a>
            <a href="#pricing" className="text-zinc-300 hover:text-white">料金</a>
            <a href="#contact" className="text-zinc-300 hover:text-white">お問い合わせ</a>
          </nav>
          <Button variant="outline" className="text-white border-zinc-700">
            無料で始める
          </Button>
        </div>
      </header>

      <main>
        <section className="container mx-auto py-20 px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">あなたのビジネスを次のレベルへ</h2>
          <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
            最新のテクノロジーを活用して、効率的かつスケーラブルなソリューションを提供します。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
              デモを見る
            </Button>
            <Button variant="outline" className="border-zinc-700 text-white px-8 py-6 text-lg">
              詳細を見る
            </Button>
          </div>
        </section>

        <section id="features" className="bg-zinc-900 py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">主な機能</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-zinc-800 border-zinc-700 p-6">
                <h3 className="text-xl font-bold text-white mb-3">高速なパフォーマンス</h3>
                <p className="text-zinc-300">
                  最適化されたアルゴリズムにより、高速な処理速度を実現します。
                </p>
              </Card>
              <Card className="bg-zinc-800 border-zinc-700 p-6">
                <h3 className="text-xl font-bold text-white mb-3">安全なデータ保護</h3>
                <p className="text-zinc-300">
                  最新のセキュリティ対策で、あなたの大切なデータを守ります。
                </p>
              </Card>
              <Card className="bg-zinc-800 border-zinc-700 p-6">
                <h3 className="text-xl font-bold text-white mb-3">24時間サポート</h3>
                <p className="text-zinc-300">
                  いつでも問題解決をサポートする専門チームが待機しています。
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black py-12 px-4">
        <div className="container mx-auto text-center text-zinc-400">
          <p>© 2025 BrandName. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}`
