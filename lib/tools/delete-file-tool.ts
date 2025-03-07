import { tool } from "ai"
import { z } from "zod"

/**
 * ファイルを削除する
 */
export function deleteFileTool() {
  return tool({
    description: "ファイルを削除する",
    parameters: z.object({ path: z.string() }),
  })
}
