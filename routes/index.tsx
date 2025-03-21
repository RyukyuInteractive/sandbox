import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  ArrowRight,
  Clock,
  Code,
  Menu,
  MessageCircle,
  Paintbrush,
  PlusCircle,
  Shield,
  X,
  Zap,
} from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { LinkButton } from "~/components/ui/link-button"
import { client } from "~/lib/client"
import type { Project } from "~/types/workspace"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: "/" })

  const result = useQuery<Project[]>({
    initialData: [],
    queryKey: [client.projects.$url()],
    queryFn: async () => {
      const res = await client.projects.$get()
      const json = await res.json()
      return json as never
    },
  })

  const createProject = useMutation({
    mutationKey: ["projects"],
    mutationFn: async () => {
      const res = await client.projects.$post()
      const json = await res.json()
      return json
    },
  })

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const mainRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const prompt = formData.get("prompt")

    const project = await createProject.mutateAsync()

    navigate({
      to: "/$project",
      params: { project: project.id },
      search: {
        ...(typeof prompt === "string" && { prompt }),
      },
    })
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-zinc-900 via-gray-900 to-black">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 transform border-zinc-800 border-r bg-black/50 backdrop-blur-sm transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}
      >
        <div className="sticky top-0 space-y-2 border-zinc-800 border-b bg-black/70 p-4 pt-16 backdrop-blur-sm">
          <Button
            type="submit"
            form="new-room"
            className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <PlusCircle className="h-5 w-5" />
            <span>チャットを新規作成</span>
          </Button>

          <LinkButton
            to="/settings"
            variant="ghost"
            className="w-full justify-center gap-2 text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
          >
            <Shield className="h-5 w-5" />
            <span>APIキーの設定</span>
          </LinkButton>
        </div>

        <nav className="space-y-4 p-4">
          <div className="flex items-center gap-2 px-2 text-sm text-zinc-400">
            <Clock className="h-4 w-4" />
            <span>最近のチャット</span>
          </div>
          <div className="space-y-1">
            {result.data.map((item) => (
              <LinkButton
                to="/$project"
                params={{ project: item.id }}
                key={item.id}
                variant="ghost"
                className="w-full justify-start overflow-hidden text-sm text-zinc-300 hover:text-white"
              >
                <span className="block w-full truncate text-left">
                  {item.messages.find(({ role }) => role === "user")?.content ?? '新しいチャット'}
                </span>
              </LinkButton>
            ))}
          </div>
        </nav>
      </aside>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-zinc-400 hover:text-white" />
        ) : (
          <Menu className="h-6 w-6 text-zinc-400 hover:text-white" />
        )}
      </Button>

      {/* Main Content */}
      <main
        ref={mainRef}
        className={`min-h-screen flex-1 overflow-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? "pl-72" : "pl-0"}
        `}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
            <h1 className="group relative mb-6 font-black text-7xl">
              <span className="-top-1 -left-1 absolute animate-pulse text-emerald-500/50 blur-[2px]">
                sandbox
              </span>
              <span className="-top-0.5 -left-0.5 absolute text-purple-400/50 blur-[1px] transition-colors duration-300 group-hover:text-rose-400/50">
                sandbox
              </span>
              <span className="relative cursor-default bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-transparent transition-all duration-300 group-hover:from-emerald-200 group-hover:to-white">
                sandbox
              </span>
            </h1>
            <p className="mb-12 max-w-2xl text-xl text-zinc-300">
              あなたの要件を入力するだけで、AIがWebサイトを作成します。
              プログラミングの知識は必要ありません。
            </p>

            <Card className="w-full max-w-3xl border-zinc-800 bg-black/30">
              <div className="p-6">
                <form
                  id="new-room"
                  onSubmit={handleSubmit}
                  className="flex flex-col space-y-4"
                >
                  <div className="relative">
                    <MessageCircle className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 transform text-zinc-400" />
                    <Input
                      className="border-zinc-800 bg-zinc-900/80 pl-10 text-white placeholder:text-zinc-400"
                      placeholder="Webサイトの要件を入力してください..."
                      name="prompt"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="group bg-emerald-600 py-6 text-lg text-white hover:bg-emerald-700"
                  >
                    作成を開始する
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </div>
            </Card>

            <div className="mt-20 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="mb-3 font-semibold text-xl">簡単操作</h3>
                <p className="text-zinc-400">
                  要件を日本語で入力するだけで、AIが最適なウェブサイトを提案します
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 flex items-center justify-center">
                  <Code className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="mb-3 font-semibold text-xl">
                  リアルタイムプレビュー
                </h3>
                <p className="text-zinc-400">
                  生成されたコードをその場でプレビュー。すぐに結果が確認できます
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 flex items-center justify-center">
                  <Paintbrush className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="mb-3 font-semibold text-xl">カスタマイズ自由</h3>
                <p className="text-zinc-400">
                  生成されたコードは自由に編集可能。あなたの好みに合わせて調整できます
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
