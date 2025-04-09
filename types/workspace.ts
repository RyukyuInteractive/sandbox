import type { Message } from "ai"
import type { PresetID } from "~/lib/presets"

export type Project = {
  id: string
  messages: Message[]
  files: Record<string, string>
  presetId?: PresetID
}
