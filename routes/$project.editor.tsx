import { createFileRoute } from "@tanstack/react-router"
import { StandaloneEditor } from "~/components/editor/standalone-editor"
import { useProject } from "~/hooks/use-project"

export const Route = createFileRoute("/$project/editor")({
  component: EditorPage,
})

function EditorPage() {
  const { project } = Route.useParams()
  const projectData = useProject(project)

  return (
    <StandaloneEditor
      projectId={project}
      files={projectData.data.files}
      preSaveFiles={projectData.preSaveData.files}
      onSave={projectData.save}
      onPreSave={projectData.preSave}
    />
  )
}
