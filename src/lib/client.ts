import { hc } from "hono/client"
import { hono } from "~/hono"

export const client = hc<typeof hono>("http://localhost:5173", {
  fetch(input, requestInit, _) {
    return hono.request(input, requestInit)
  },
})
