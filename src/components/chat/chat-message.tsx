import type { UIMessage } from "ai"
import { AssistantMessage } from "~/components/chat/assistant-message"
import { UserMessage } from "~/components/chat/user-message"

type Props = {
  message: UIMessage
}

export function ChatMessage(props: Props) {
  if (props.message.role === "user") {
    return (
      <div className="flex justify-end pl-16">
        <UserMessage message={props.message} />
      </div>
    )
  }

  if (props.message.role === "assistant") {
    if (props.message.content.length === 0) {
      return null
    }

    const parts = props.message.parts

    return parts.map((part, index) => (
      <div className="flex pr-16" key={index.toFixed()}>
        <AssistantMessage part={part} />
      </div>
    ))
  }

  console.log("data", props.message)

  return null
}
