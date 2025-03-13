import {
  type LanguageModelV1,
  type LanguageModelV1Middleware,
  type LanguageModelV1StreamPart,
  simulateReadableStream,
} from "ai"
import { cacheStorage } from "~/lib/cache-storage"
import { createCacheKey } from "~/lib/create-cache-key"

export const cacheMiddleware: LanguageModelV1Middleware = {
  wrapGenerate: async ({ doGenerate, params, model }) => {
    const cacheKey = await createCacheKey({ params, model })

    const cached =
      await cacheStorage.get<
        Awaited<ReturnType<LanguageModelV1["doGenerate"]>>
      >(cacheKey)

    if (cached !== null) {
      return {
        ...cached,
        response: {
          ...cached.response,
          timestamp: cached?.response?.timestamp
            ? new Date(cached?.response?.timestamp)
            : undefined,
        },
      }
    }

    const result = await doGenerate()

    await cacheStorage.set(cacheKey, result)

    return result
  },
  wrapStream: async ({ doStream, params, model }) => {
    const cacheKey = await createCacheKey({ params, model })

    const cached = await cacheStorage.get<LanguageModelV1StreamPart[]>(cacheKey)

    if (cached !== null) {
      const formattedChunks = (cached as LanguageModelV1StreamPart[]).map(
        (p) => {
          if (p.type === "response-metadata" && p.timestamp) {
            return { ...p, timestamp: new Date(p.timestamp) }
          }
          return p
        },
      )
      return {
        stream: simulateReadableStream({
          initialDelayInMs: 0,
          chunkDelayInMs: 10,
          chunks: formattedChunks,
        }),
        rawCall: { rawPrompt: null, rawSettings: {} },
      }
    }

    // If not cached, proceed with streaming
    const { stream, ...rest } = await doStream()

    const fullResponse: LanguageModelV1StreamPart[] = []

    const transformStream = new TransformStream<
      LanguageModelV1StreamPart,
      LanguageModelV1StreamPart
    >({
      transform(chunk, controller) {
        fullResponse.push(chunk)
        controller.enqueue(chunk)
      },
      async flush() {
        // Store the full response in the cache after streaming is complete
        await cacheStorage.set<LanguageModelV1StreamPart[]>(
          cacheKey,
          fullResponse,
        )
      },
    })

    return {
      stream: stream.pipeThrough(transformStream),
      ...rest,
    }
  },
}
