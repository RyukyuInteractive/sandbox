import { tool } from "ai"
import { z } from "zod"

/**
 * ファイル内を正規表現で検索する
 */
export function searchFilesTool() {
  return tool({
    description:
      "正規表現でファイルを検索する（ファイルのパスの配列を受け取る）",
    parameters: z.object({
      regex: z.string(),
    }),
  })
}
