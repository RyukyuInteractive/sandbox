import { tool } from "ai"
import { z } from "zod"

export function listFilesTool() {
  return tool({
    description: "ディレクトリ内のファイル一覧を取得する",
    parameters: z.object({
      path: z.string(),
    }),
  })
}
