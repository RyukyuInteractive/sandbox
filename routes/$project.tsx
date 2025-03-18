import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { Workspace } from "~/components/workspace/workspace"
import { ErrorPage } from "~/components/pages/error-page"

const searchSchema = z.object({
  prompt: z.string().optional(),
})

export const Route = createFileRoute("/$project")({
  component: RouteComponent,
  errorComponent: ErrorPage,
  validateSearch(search) {
    return searchSchema.parse(search)
  },
})

function RouteComponent() {
  const params = Route.useParams()

  const search = Route.useSearch()

  return <Workspace projectId={params.project} prompt={search.prompt} />
}
