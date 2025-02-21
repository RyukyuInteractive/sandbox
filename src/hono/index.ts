import { factory } from "~/hono/factory"
import * as index from "~/hono/routes/index"
import * as messages from "~/hono/routes/messages"

export const hono = factory
  .createApp()
  .post("/messages", ...messages.POST)
  .get("/messages", ...messages.GET)
  .post("/", ...index.POST)
