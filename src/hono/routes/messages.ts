import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { factory } from "~/hono/factory"
import { MessageStorage } from "~/lib/message-storage"

export const POST = factory.createHandlers(
  zValidator("json", z.object({ text: z.string() })),
  async (c) => {
    const json = c.req.valid("json")

    const storage = new MessageStorage()

    const message = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: json.text,
    }

    storage.push(message)

    return c.json(message)
  },
)

export const GET = factory.createHandlers((c) => {
  const storage = new MessageStorage()

  const messages = storage.findMany()

  return c.json(messages)
})
