import { tool } from "ai"
import { z } from "zod"

export function writeFileTool() {
  return tool({
    description: "ファイルに書き込む",
    parameters: z.object({
      path: z.string(),
      content: z.string(),
    }),
  })
}
