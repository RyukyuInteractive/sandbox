import { tool } from "ai"
import { z } from "zod"

export function askFollowupQuestionTool() {
  return tool({
    description: "ユーザーに追加の質問をする",
    parameters: z.object({ question: z.string() }),
  })
}
