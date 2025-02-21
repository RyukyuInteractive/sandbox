import { z } from "zod"
import { zAssistantObjectChat } from "~/lib/validations/assistant-object-chat"
import { zAssistantObjectContext } from "~/lib/validations/assistant-object-context"
import { zAssistantObjectShadcnuiCode } from "~/lib/validations/assistant-object-shadcnui-code"
import { zAssistantObjectShadcnuiDeps } from "~/lib/validations/assistant-object-shadcnui-deps"
import { zAssistantObjectTasks } from "~/lib/validations/assistant-object-tasks"

export const zAssistantMessage = z.union([
  z.object({
    id: z.string().nullable(),
    role: z.literal("assistant"),
    type: z.literal("context"),
    content: zAssistantObjectContext,
  }),
  z.object({
    id: z.string().nullable(),
    role: z.literal("assistant"),
    type: z.literal("chat"),
    content: zAssistantObjectChat,
  }),
  z.object({
    id: z.string().nullable(),
    role: z.literal("assistant"),
    type: z.literal("deps"),
    content: zAssistantObjectShadcnuiDeps,
  }),
  z.object({
    id: z.string().nullable(),
    role: z.literal("assistant"),
    type: z.literal("code"),
    content: zAssistantObjectShadcnuiCode,
  }),
  z.object({
    id: z.string().nullable(),
    role: z.literal("assistant"),
    type: z.literal("tasks"),
    content: zAssistantObjectTasks,
  }),
])
