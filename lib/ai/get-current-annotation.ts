import type { UIMessage } from "ai"

export function getCurrentAnnotation(messages: UIMessage[]) {
  if (messages.length === 0) {
    return null
  }

  const message = messages[messages.length - 1]

  if (message.annotations === undefined) {
    return null
  }

  if (message.annotations.length === 0) {
    return null
  }

  const annotation = message.annotations[message.annotations.length - 1]

  if (annotation === undefined) {
    return null
  }

  return annotation as string
}
