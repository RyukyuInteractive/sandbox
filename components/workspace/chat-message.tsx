import type { UIMessage } from "ai"
import { AssistantMessage } from "~/components/chat/assistant-message"
import { UserMessage } from "~/components/chat/user-message"

type Props = {
  message: UIMessage
}

export function ChatMessage(props: Props) {
  if (props.message.role === "user") {
    return <UserMessage message={props.message} />
  }

  if (props.message.role === "assistant") {
    const parts = props.message.parts

    return parts.map((part, index) => (
      <AssistantMessage key={index.toFixed()} part={part} />
    ))
  }

  console.log("data", props.message)

  return null
}
