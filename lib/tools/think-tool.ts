import { tool } from "ai"
import { z } from "zod"

export function thinkingTool() {
  return tool({
    description: "現在の思考プロセスを説明する。",
    parameters: z.object({
      message_to_user: z.string(),
    }),
    async execute(args) {
      return { ok: true }
    },
  })
}
