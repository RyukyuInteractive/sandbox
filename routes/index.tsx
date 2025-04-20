import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { LinkButton } from "~/components/ui/link-button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { Textarea } from "~/components/ui/textarea"
import { client } from "~/lib/client"
import { presets } from "~/lib/presets"
import type { PresetID } from "~/lib/presets"
import type { Project } from "~/types/workspace"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: "/" })
  const [selectedPreset, setSelectedPreset] = useState<PresetID>("main")
  const mainRef = useRef<HTMLDivElement>(null)

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
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="pb-4">
          <h1 className="font-bold text-xl">Sandbox</h1>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <Button>
            <span>{"新しいプロジェクト"}</span>
          </Button>
          <div className="space-y-2">
            {result.data.map((item) => (
              <div key={item.id}>
                <LinkButton
                  to="/$project"
                  params={{ project: item.id }}
                  variant="outline"
                  className="h-auto max-h-auto w-full justify-start overflow-hidden"
                >
                  {item.messages.find(({ role }) => role === "user")?.content ??
                    "-"}
                </LinkButton>
              </div>
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter>
          <LinkButton to="/settings" variant="secondary" className="text-sm">
            設定
          </LinkButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-2">
          <SidebarTrigger />
        </div>
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <div className="space-y-4">
            <div className="space-y-6 text-center">
              <h2 className="font-bold text-4xl">{"Vibe Coding Sandbox"}</h2>
            </div>
            <form
              id="new-project"
              onSubmit={handleSubmit}
              className="flex flex-col space-y-6 p-6"
            >
              <div className="space-y-2">
                <Textarea
                  placeholder="Webサイトの要件を入力してください..."
                  name="prompt"
                  style={{ resize: "none" }}
                />
                <div className="flex flex-wrap gap-2">
                  {Object.values(presets).map((preset) => (
                    <Button
                      key={preset.id}
                      value={preset.id}
                      onClick={(event) => {
                        event.preventDefault()
                        setSelectedPreset(preset.id as PresetID)
                      }}
                      variant={
                        selectedPreset === preset.id ? "default" : "outline"
                      }
                      size="sm"
                      className="mb-2"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
              <Button type="submit" size={"lg"} variant="default">
                {"作成する"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
