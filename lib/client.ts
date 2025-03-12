import { hc } from "hono/client"
import { hono } from "~/system"
import type { AppType } from "~/system"

export const client = hc<AppType>("http://localhost:5173", {
  fetch(input, requestInit, _) {
    return hono.request(input, requestInit)
  },
})
