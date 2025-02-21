import type { ChatMessage } from "~/types/chat-message"

const messages: ChatMessage[] = []

export class MessageStorage {
  push(message: ChatMessage) {
    messages.push(message)
  }

  findMany() {
    return messages
  }
}
