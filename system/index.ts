import { factory } from "~/system/factory"
import * as index from "~/system/routes/index"
import * as message$roomId from "~/system/routes/message.$roomId"
import * as messages from "~/system/routes/messages"

export const hono = factory
  .createApp()
  .post("/", ...index.POST)
  .get("/messages", ...messages.GET)
  .get("/message/:roomId", ...message$roomId.GET)

export type AppType = typeof hono
