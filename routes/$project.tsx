import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { Message } from "ai"
import { z } from "zod"
import { Workspace } from "~/components/workspace/workspace"
import { client } from "~/lib/client"

const endpoint = client.projects[":project"].messages

const searchSchema = z.object({
  prompt: z.string().optional(),
})

export const Route = createFileRoute("/$project")({
  component: RouteComponent,
  validateSearch(search) {
    return searchSchema.parse(search)
  },
})

function RouteComponent() {
  const params = Route.useParams()

  const search = Route.useSearch()

  const { data } = useQuery<Message[]>({
    queryKey: [endpoint.$url({ param: { project: params.project } })],
    queryFn: async () => {
      const res = await endpoint.$get({
        param: { project: params.project },
      })
      const json = await res.json()
      return json as never
    },
  })

  return (
    <Workspace
      messages={data}
      prompt={search.prompt}
      projectId={params.project}
    />
  )
}
