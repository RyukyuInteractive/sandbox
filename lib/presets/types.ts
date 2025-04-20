export interface Preset {
  id: string
  name: string
  description: string
  files: Record<string, string>
}

export type PresetID = "main" | "vite" | "landing-page" | "blog" | "portfolio"
