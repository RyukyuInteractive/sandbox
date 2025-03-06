import { factory } from "~/system/factory"
import * as index from "~/system/routes/index"
import * as messages from "~/system/routes/messages"

export const hono = factory
  .createApp()
  .post("/messages", ...messages.POST)
  .get("/messages", ...messages.GET)
  .post("/", ...index.POST)
