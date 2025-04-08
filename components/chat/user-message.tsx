import type { UIMessage } from "ai"
import { Card } from "~/components/ui/card"

type Props = {
  message: UIMessage
}

export function UserMessage(props: Props) {
  return (
    <div className="flex flex-col items-end space-y-1">
      <Card className={"bg-muted p-4 text-xs/6"}>
        <div>{props.message.content}</div>
      </Card>
      <div className="space-x-2 text-right text-muted text-xs">
        <span>{props.message.createdAt?.toLocaleString()}</span>
        <span>{"あなた"}</span>
      </div>
    </div>
  )
}
