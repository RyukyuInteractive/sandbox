import type { Message } from "@ai-sdk/ui-utils"
import { messageStorage } from "~/lib/message-storage"
import { factory } from "~/system/factory"

export const GET = factory.createHandlers(async (c) => {
  const roomId = c.req.param("roomId")

  if (typeof roomId !== "string") {
    throw c.json({ error: "project is required" }, 400)
  }

  const messages = (await messageStorage.get<Message[]>(roomId)) ?? []

  return c.json(messages)
})
