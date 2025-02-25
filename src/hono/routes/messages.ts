import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { factory } from "~/hono/factory"
import { MessageStorage } from "~/lib/message-storage"

export const POST = factory.createHandlers(
  zValidator("json", z.object({ text: z.string() })),
  async (c) => {
    return c.json({})
  },
)

export const GET = factory.createHandlers((c) => {
  const storage = new MessageStorage()

  const messages = storage.findMany()

  return c.json([])
})
