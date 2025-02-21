import type { StreamObjectResult } from "ai"
import type { StreamingApi } from "hono/utils/stream"

type Props = {
  isEnd?: boolean
}

export async function createMessageObject<T, U>(
  stream: StreamingApi,
  type: T,
  result: StreamObjectResult<unknown, U, never>,
) {
  const objectId = crypto.randomUUID()

  stream.write(
    `{ "id": "${objectId}", "role": "assistant", "type": "${type}", "content": `,
  )

  for await (const text of result.textStream) {
    stream.write(text)
  }

  stream.writeln("},")

  const content = await result.object

  return {
    id: objectId,
    role: "assistant" as const,
    type: type as never,
    content: content,
  }
}
