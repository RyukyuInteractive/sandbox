import { hc } from "hono/client"
import { hono } from "~/system"

export const client = hc<typeof hono>("http://localhost:5173", {
  fetch(input, requestInit, _) {
    return hono.request(input, requestInit)
  },
})
