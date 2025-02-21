import type { DeepPartial } from "@ai-sdk/ui-utils"
import type { ChatMessage } from "~/types/chat-message"
import { Card } from "../ui/card"

type Props = {
  node: DeepPartial<ChatMessage>
}

export function ChatMessageItem(props: Props) {
  if (props.node.role === undefined) {
    return null
  }

  if (props.node.role === "user") {
    return (
      <Card className="p-2">
        <p className="text-sm">{props.node.content as string}</p>
      </Card>
    )
  }

  if (props.node.role !== "assistant") {
    return null
  }

  if (props.node.type === "context") {
    const isDone =
      props.node?.content?.context === "edit_files" ||
      props.node?.content?.context === "chat_only"

    if (isDone) {
      return null
    }

    return (
      <Card className="p-2">
        <p className="text-sm">{"🧠 文脈を考え中.."}</p>
      </Card>
    )
  }

  if (props.node.type === "chat") {
    const message = props.node.content?.message_to_user ?? "💬 考え中.."

    return (
      <Card className="p-2">
        <p className="text-sm">{message}</p>
      </Card>
    )
  }

  if (props.node.type === "tasks") {
    const message =
      props?.node?.content?.message_to_user ?? "📠 要件を書き出し中.."

    return (
      <Card className="space-y-2 p-2">
        <p className="text-sm">{message}</p>
        <ul className="space-y-2 text-xs">
          {props?.node?.content?.functions?.map((node) => (
            <Card key={node} className="px-2 py-1">
              <li>{`${node}`}</li>
            </Card>
          ))}
        </ul>
      </Card>
    )
  }

  if (props.node.type === "deps") {
    const message = props?.node?.content?.message_to_user ?? "👀 要件を確認中.."

    return (
      <Card className="space-y-2 p-2">
        <p className="text-sm">{message}</p>
        <ul className="space-y-1 text-xs">
          {props?.node?.content?.components?.map((node, index) => (
            <Card key={node} className="px-2 py-1">
              <div>{`${node}`}</div>
            </Card>
          ))}
        </ul>
      </Card>
    )
  }

  if (props.node.type === "code") {
    const message =
      props?.node?.content?.message_to_user ?? "🖋️ コードを修正中.."

    return (
      <Card className="p-2">
        <p className="text-sm">{message}</p>
      </Card>
    )
  }

  return null
}
