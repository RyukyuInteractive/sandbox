import {
  type DeepPartial,
  type ReasoningUIPart,
  type SourceUIPart,
  type TextUIPart,
  type ToolInvocationUIPart,
  parsePartialJson,
} from "@ai-sdk/ui-utils"
import type { z } from "zod"
import { Card } from "~/components/ui/card"
import type { zPart } from "~/lib/parts/part"

type DeepPartialBlock = DeepPartial<z.infer<typeof zPart>>

type Props = {
  part: TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart
}

export function AssistantMessage(props: Props) {
  if (props.part.type === "text") {
    const json = parsePartialJson(props.part.text)

    const block = json.value as DeepPartialBlock

    if (block.type === "message") {
      return (
        <Card className="py-2 pr-4 pl-2">
          <div>{block.message_to_user}</div>
        </Card>
      )
    }

    if (block.type === "code") {
      return (
        <Card className="py-2 pr-4 pl-2">
          <div>{block.message_to_user}</div>
        </Card>
      )
    }
  }

  return null
}
