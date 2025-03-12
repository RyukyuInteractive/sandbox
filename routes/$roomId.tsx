import { createFileRoute } from "@tanstack/react-router"
import { Workspace } from "~/components/workspace/workspace"

export const Route = createFileRoute("/$roomId")({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()

  return <Workspace roomId={params.roomId} />
}
