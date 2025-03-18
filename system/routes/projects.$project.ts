import type { Message } from "@ai-sdk/ui-utils"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { fileStorage } from "~/lib/file-storage"
import { messageStorage } from "~/lib/message-storage"
import { factory } from "~/system/factory"
import type { Project } from "~/types/workspace"

export const GET = factory.createHandlers(async (c) => {
  const projectId = c.req.param("project")

  if (typeof projectId !== "string") {
    throw new HTTPException(400, { message: "Invalid project ID" })
  }

  const messages = await messageStorage.get<Message[]>(projectId)
  const files = await fileStorage.get<Record<string, string>>(projectId)

  const project = {
    id: projectId,
    messages: messages ?? [],
    files: files ?? {},
  } satisfies Project

  return c.json(project)
})

export const PUT = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      // messages: z.array(z.any()),
      files: z.record(z.string(), z.string()),
    }),
  ),
  async (c) => {
    const projectId = c.req.param("project")
    const json = c.req.valid("json")

    if (typeof projectId !== "string") {
      throw new HTTPException(400, { message: "Invalid project ID" })
    }

    await fileStorage.set(projectId, json.files)

    const messages = await messageStorage.get<Message[]>(projectId)
    const files = await fileStorage.get<Record<string, string>>(projectId)

    const project = {
      id: projectId,
      messages: messages ?? [],
      files: files ?? {},
    } satisfies Project

    return c.json(project)
  },
)
