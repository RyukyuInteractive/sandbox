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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { client } from "~/lib/client"
import { presets } from "~/lib/presets"
import type { PresetID } from "~/lib/presets"
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
    mutationFn: async (presetId: PresetID) => {
      const res = await client.projects.$post({
        json: { presetId },
      })
      const json = await res.json()
      return json
    },
  })

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState<PresetID>("main")

  const mainRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const prompt = formData.get("prompt")

    const project = await createProject.mutateAsync(selectedPreset)

    navigate({
      to: "/$project",
      params: { project: project.id },
      search: {
        ...(typeof prompt === "string" && { prompt }),
      },
    })
  }

  return (
    <div className="flex min-h-screen bg-zinc-900">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 transform border-zinc-800 border-r bg-black backdrop-blur-sm transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}
      >
        {/* タイトル */}
        <div className="sticky top-0 border-zinc-800 border-b bg-black p-4 pt-16 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white">Sandbox</h1>
        </div>

        <nav className="flex flex-col h-[calc(100vh-80px)]">
          {/* プロジェクト */}
          <div className="p-4">
            <h2 className="mb-2 text-sm font-semibold text-zinc-400">プロジェクト</h2>
            <div className="space-y-1">
              <Button
                type="submit"
                form="new-room"
                className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <PlusCircle className="h-4 w-4" />
                <span>新しいプロジェクト</span>
              </Button>
              
              <div className="mt-2 space-y-1">
                {result.data.map((item) => (
                  <LinkButton
                    to="/$project"
                    params={{ project: item.id }}
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start overflow-hidden text-sm text-zinc-300 hover:text-white"
                  >
                    <span className="block w-full truncate text-left">
                      {item.messages.find(({ role }) => role === "user")?.content ??
                        "新しいプロジェクト"}
                      {item.presetId && (
                        <span className="ml-1 text-xs text-emerald-400">
                          [{presets[item.presetId as PresetID]?.name || item.presetId}]
                        </span>
                      )}
                    </span>
                  </LinkButton>
                ))}
              </div>
            </div>
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
        <div className="container mx-auto p-2">
          <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
            <h1 className="relative mb-6 font-black text-7xl text-white">
              sandbox
            </h1>
            <p className="mb-12 max-w-2xl text-xl text-zinc-300">
              あなたの要件を入力するだけで、AIがWebサイトを作成します。
              プログラミングの知識は必要ありません。
            </p>

            <Card className="w-full max-w-3xl border-zinc-800 bg-black">
              <div className="p-4">
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
                  <div className="space-y-2">
                    <label className="block text-sm text-zinc-400">
                      プリセットを選択
                    </label>
                    <Select
                      value={selectedPreset}
                      onValueChange={(value) => setSelectedPreset(value as PresetID)}
                    >
                      <SelectTrigger className="border-zinc-800 bg-zinc-900/80 text-white">
                        <SelectValue placeholder="プリセットを選択" />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-800 bg-zinc-900 text-white">
                        {Object.values(presets).map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.name} - {preset.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
