import { zValidator } from "@hono/zod-validator"
import { createDataStreamResponse } from "ai"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { factory } from "~/system/factory"
import { writeChatStream } from "~/system/lib/write-chat-stream"

export const POST = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      id: z.string(),
      messages: z.array(z.any()),
      template: z.string(),
      files: z.record(z.string(), z.string()),
      apiKey: z.string().nullable(),
    }),
  ),
  async (c) => {
    const json = c.req.valid("json")

    console.log("json", json)

    const apiKey = json.apiKey ?? import.meta.env.VITE_OPENAI_API_KEY ?? null

    if (apiKey == null) {
      throw new HTTPException(400, { message: "API key is required" })
    }

    return createDataStreamResponse({
      async execute(stream) {
        await writeChatStream(stream, {
          apiKey,
          template: "",
          files: json.files,
          messages: json.messages,
          onMessage() {},
        })
      },
      onError(error) {
        console.error(error)
        if (error instanceof Error) {
          return error.message
        }
        return "ERROR"
      },
    })
  },
)
