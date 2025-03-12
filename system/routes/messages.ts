import type { Message } from 'ai'
import { messageStorage } from "~/lib/message-storage"
import { factory } from "~/system/factory"

export const GET = factory.createHandlers(async (c) => {
  const roomIds = await messageStorage.keys()

  const messages = await Promise.all(
    roomIds.map(async roomId => ({
      roomId,
      messages: await messageStorage.get<Message[]>(roomId) ?? []
    }))
  )

  return c.json(messages)
})
