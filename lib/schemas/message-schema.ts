import { z } from "zod"

/**
 * JSONValue型の定義
 */
const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.null(),
    z.string(),
    z.number(),
    z.boolean(),
    z.record(z.string(), jsonValueSchema),
    z.array(jsonValueSchema),
  ]),
)

/**
 * ツール呼び出しの状態を定義するスキーマ
 */
const toolCallSchema = z.object({
  id: z.string(),
  type: z.string(),
  function: z.object({
    name: z.string(),
    arguments: z.string(),
  }),
})

/**
 * ツール結果を定義するスキーマ
 */
const toolResultSchema = z.object({
  toolCallId: z.string(),
  content: z.unknown(),
})

/**
 * ツール呼び出しの状態を定義するスキーマ
 */
const toolInvocationSchema = z.discriminatedUnion("state", [
  z.object({
    state: z.literal("partial-call"),
    step: z.number().optional(),
    id: z.string(),
    type: z.string(),
    function: z.object({
      name: z.string(),
      arguments: z.string(),
    }),
  }),
  z.object({
    state: z.literal("call"),
    step: z.number().optional(),
    id: z.string(),
    type: z.string(),
    function: z.object({
      name: z.string(),
      arguments: z.string(),
    }),
  }),
  z.object({
    state: z.literal("result"),
    step: z.number().optional(),
    toolCallId: z.string(),
    content: z.unknown(),
  }),
])

/**
 * 添付ファイルを定義するスキーマ
 */
const attachmentSchema = z.object({
  name: z.string().optional(),
  contentType: z.string().optional(),
  url: z.string(),
})

/**
 * メッセージのパーツを定義するスキーマ
 */
const textUiPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
})

const reasoningDetailsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string(),
    signature: z.string().optional(),
  }),
  z.object({
    type: z.literal("redacted"),
    data: z.string(),
  }),
])

const reasoningUiPartSchema = z.object({
  type: z.literal("reasoning"),
  reasoning: z.string(),
  details: z.array(reasoningDetailsSchema),
})

const toolInvocationUiPartSchema = z.object({
  type: z.literal("tool-invocation"),
  toolInvocation: toolInvocationSchema,
})

const sourceUiPartSchema = z.object({
  type: z.literal("source"),
  source: z.object({
    type: z.string(),
    title: z.string().optional(),
    url: z.string().optional(),
    citation: z.string().optional(),
  }),
})

const messagePartsSchema = z.array(
  z.discriminatedUnion("type", [
    textUiPartSchema,
    reasoningUiPartSchema,
    toolInvocationUiPartSchema,
    sourceUiPartSchema,
  ]),
)

/**
 * AIメッセージのスキーマ
 */
export const messageSchema = z.object({
  id: z.string(),
  createdAt: z.date().optional(),
  content: z.string(),
  reasoning: z.string().optional(),
  experimental_attachments: z.array(attachmentSchema).optional(),
  role: z.enum(["system", "user", "assistant", "data"]),
  data: jsonValueSchema.optional(),
  annotations: z.array(jsonValueSchema).optional(),
  toolInvocations: z.array(toolInvocationSchema).optional(),
  parts: messagePartsSchema.optional(),
})

export type Message = z.infer<typeof messageSchema>

/**
 * UIメッセージのスキーマ（通常のメッセージとは異なり、partsが必須）
 */
export const uiMessageSchema = messageSchema.extend({
  parts: messagePartsSchema,
})

export type UiMessage = z.infer<typeof uiMessageSchema>

/**
 * 新規メッセージ作成用のスキーマ（idはオプション）
 */
export const createMessageSchema = messageSchema.omit({ id: true }).extend({
  id: z.string().optional(),
})

export type CreateMessage = z.infer<typeof createMessageSchema>

/**
 * メッセージの配列を定義するスキーマ
 */
export const messagesSchema = z.array(messageSchema)
