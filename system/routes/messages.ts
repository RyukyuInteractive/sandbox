import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { MessageStorage } from "~/lib/message-storage"
import { factory } from "~/system/factory"

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
