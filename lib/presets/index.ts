import { blogPreset } from "./blog"
import { landingPagePreset } from "./landing-page"
import { mainPreset } from "./main"
import { portfolioPreset } from "./portfolio"
import type { Preset, PresetID } from "./types"
import { vitePreset } from "./vite"

export const presets: Record<PresetID, Preset> = {
  "main": mainPreset,
  "vite": vitePreset,
  "landing-page": landingPagePreset,
  "blog": blogPreset,
  "portfolio": portfolioPreset,
}

export { type Preset, type PresetID } from "./types"
