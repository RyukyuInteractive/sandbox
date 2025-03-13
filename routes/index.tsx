import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { TopPage } from "~/components/pages/top-page"
import { client } from "~/lib/client"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useQuery({
    initialData: [],
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await client.messages.$get()

      return await res.json()
    },
  })

  return <TopPage messageRooms={data} />
}
