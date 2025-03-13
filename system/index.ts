import { factory } from "~/system/factory"

import * as index from "~/system/routes/index"
import * as projects from "~/system/routes/projects"
import * as projects$project from "~/system/routes/projects.$project"

export const hono = factory
  .createApp()
  .post("/", ...index.POST)
  .get("/projects", ...projects.GET)
  .get("/projects/:project/messages", ...projects$project.GET)

export type AppType = typeof hono
