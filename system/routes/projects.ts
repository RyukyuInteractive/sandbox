import { messageStorage } from "~/lib/message-storage"
import { factory } from "~/system/factory"

export const GET = factory.createHandlers(async (c) => {
  const messages = await messageStorage.keys()

  return c.json(messages)
})
