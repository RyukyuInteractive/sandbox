import { generateId } from "ai"
import type { Message } from "ai"
import { fileStorage } from "~/lib/file-storage"
import { messageStorage } from "~/lib/message-storage"
import { presets } from "~/lib/presets"
import type { PresetID } from "~/lib/presets"
import { factory } from "~/system/factory"
import type { Project } from "~/types/workspace"

export const GET = factory.createHandlers(async (c) => {
  const projectIds = await messageStorage.keys()

  const promises = projectIds.map(async (projectId): Promise<Project> => {
    const messages = await messageStorage.get<Message[]>(projectId)
    const files = await fileStorage.get<Record<string, string>>(projectId)
    const presetId = await fileStorage.get<PresetID>(`${projectId}_preset`)
    const title = await fileStorage.get<string>(`${projectId}_title`) || "無題のプロジェクト"
    return {
      id: projectId,
      title,
      messages: messages ?? [],
      files: files ?? {},
      presetId: presetId ?? "main",
    } satisfies Project
  })

  const projects = await Promise.all(promises)

  return c.json(projects)
})

/**
 * 新規プロジェクトを作成します。
 */
export const POST = factory.createHandlers(async (c) => {
  const body = await c.req.json()
  const presetId = (body.presetId as PresetID) || "main"
  const title = (body.title as string) || "無題のプロジェクト"

  const project = {
    id: generateId(),
    title,
    messages: [],
    files: presets[presetId].files,
    presetId,
  } satisfies Project

  await messageStorage.set(project.id, project.messages)
  await fileStorage.set(project.id, project.files)
  await fileStorage.set(`${project.id}_preset`, project.presetId)
  await fileStorage.set(`${project.id}_title`, project.title)

  return c.json(project)
})
