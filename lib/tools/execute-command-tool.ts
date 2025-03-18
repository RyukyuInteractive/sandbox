import { tool } from "ai"
import { z } from "zod"

/**
 * コマンドを実行する
 */
export function executeCommandTool() {
  return tool({
    description: "ターミナルでコマンドを実行する",
    parameters: z.object({ command: z.string().describe("実行するコマンド (例 npm install axios") }),
  })
}
