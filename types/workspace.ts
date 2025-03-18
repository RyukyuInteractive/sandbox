import type { Message } from "ai"

export type Project = {
  id: string
  messages: Message[]
  files: Record<string, string>
}
