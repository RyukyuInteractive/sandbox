import { tool } from "ai"
import { z } from "zod"

export function readFileTool() {
  return tool({
    description: "ファイルの中身を取得する",
    parameters: z.object({ path: z.string() }),
  })
}
