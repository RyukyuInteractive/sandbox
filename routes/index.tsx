import { createFileRoute } from "@tanstack/react-router"
import { TopPage } from "~/components/pages/top-page"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <TopPage />
}
