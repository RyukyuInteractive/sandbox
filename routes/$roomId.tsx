import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { SearchSchemaInput } from "@tanstack/react-router"
import { z } from "zod"
import { Workspace } from "~/components/workspace/workspace"
import { client } from "~/lib/client"

const searchSchema = z.object({
  prompt: z.string().optional(),
})

export const Route = createFileRoute("/$roomId")({
  component: RouteComponent,
  validateSearch: (search: unknown & SearchSchemaInput) =>
    searchSchema.parse(search),
})

function RouteComponent() {
  const params = Route.useParams()
  const search = Route.useSearch()

  const { data } = useQuery({
    queryKey: ["message", params.roomId],
    queryFn: async () => {
      const res = await client.message[":roomId"].$get({
        param: { roomId: params.roomId },
      })

      return await res.json()
    },
  })

  return (
    <Workspace messages={data} prompt={search.prompt} roomId={params.roomId} />
  )
}
