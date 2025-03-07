import { tool } from "ai"
import { z } from "zod"

export function listCodeDefinitionNamesTool() {
  return tool({
    description:
      "ソースコードから定義名（クラス、関数、メソッドなど）を抽出する",
    parameters: z.object({ content: z.string() }),
  })
}
