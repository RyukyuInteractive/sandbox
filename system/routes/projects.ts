import { generateId } from "ai"
import type { Message } from "ai"
import { fileStorage } from "~/lib/file-storage"
import { messageStorage } from "~/lib/message-storage"
import { mainTemplate } from "~/lib/templates/main"
import { factory } from "~/system/factory"
import type { Project } from "~/types/workspace"

export const GET = factory.createHandlers(async (c) => {
  const projectIds = await messageStorage.keys()

  const promises = projectIds.map(async (projectId): Promise<Project> => {
    const messages = await messageStorage.get<Message[]>(projectId)
    const files = await fileStorage.get<Record<string, string>>(projectId)
    return {
      id: projectId,
      messages: messages ?? [],
      files: files ?? {},
    } satisfies Project
  })

  const projects = await Promise.all(promises)

  return c.json(projects)
})

/**
 * 新規プロジェクトを作成します。
 */
export const POST = factory.createHandlers(async (c) => {
  const project = {
    id: generateId(),
    messages: [],
    files: mainTemplate,
  } satisfies Project

  await messageStorage.set(project.id, project.messages)
  await fileStorage.set(project.id, project.files)

  return c.json(project)
})
