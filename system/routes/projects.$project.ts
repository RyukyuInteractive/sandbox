import type { Message } from "@ai-sdk/ui-utils"
import { HTTPException } from "hono/http-exception"
import { messageStorage } from "~/lib/message-storage"
import { factory } from "~/system/factory"

export const GET = factory.createHandlers(async (c) => {
  const projectId = c.req.param("project")

  if (typeof projectId !== "string") {
    throw new HTTPException(400, { message: "Invalid project ID" })
  }

  const messages = await messageStorage.get<Message[]>(projectId)

  return c.json(messages ?? [])
})
