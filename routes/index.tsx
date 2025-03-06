import { createFileRoute } from "@tanstack/react-router"
import { Workspace } from "~/components/workspace/workspace"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <Workspace projectId={"-"} />
}
