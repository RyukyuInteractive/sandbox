import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { streamText } from "hono/streaming"
import { z } from "zod"
import { factory } from "~/hono/factory"
import { writeChatStream } from "~/hono/lib/write-chat-stream"
import { MessageStorage } from "~/lib/message-storage"

export const POST = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      template: z.string(),
      files: z.record(z.string(), z.string()),
      apiKey: z.string().nullable(),
    }),
  ),
  async (c) => {
    const json = c.req.valid("json")

    const apiKey = json.apiKey ?? import.meta.env.VITE_OPENAI_API_KEY ?? null

    const storage = new MessageStorage()

    const messages = storage.findMany()

    const [userMessage] = messages.slice(-1)

    if (userMessage?.role !== "user") {
      throw new HTTPException(400, { message: "Invalid message id" })
    }

    if (apiKey == null) {
      throw new HTTPException(400, { message: "API key is required" })
    }

    return streamText(c, async (stream) => {
      return writeChatStream(stream, {
        apiKey: apiKey,
        template: json.template,
        files: json.files,
        messages: messages,
        userMessage: userMessage,
        onMessage(message) {
          storage.push(message)
        },
      })
    })
  },
)
