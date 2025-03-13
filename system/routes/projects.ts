import type { Message } from "ai"
import { messageStorage } from "~/lib/message-storage"
import { factory } from "~/system/factory"
import type { Project } from "~/types/workspace"

export const GET = factory.createHandlers(async (c) => {
  const projectIds = await messageStorage.keys()

  const promises = projectIds.map(async (roomId): Promise<Project> => {
    const messages = await messageStorage.get<Message[]>(roomId)
    return {
      id: roomId,
      messages: messages ?? [],
    }
  })

  const projects = await Promise.all(promises)

  return c.json(projects)
})
