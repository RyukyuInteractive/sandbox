import type { UIMessage } from "ai"

const messages: UIMessage[] = []

export class MessageStorage {
  push(message: UIMessage) {
    messages.push(message)
  }

  findMany() {
    return messages
  }
}
