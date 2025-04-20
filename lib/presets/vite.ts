import type { Preset } from "./types"

export const vitePreset: Preset = {
  id: "vite",
  name: "Vite + React",
  description: "シンプルなVite + Reactテンプレート",
  files: {},
}

vitePreset.files["package.json"] = JSON.stringify(
  {
    name: "react-ts",
    type: "module",
    scripts: {
      dev: "vite",
    },
    dependencies: {
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: {
      "@types/react": "^19.0.8",
      "@types/react-dom": "^19.0.3",
      "@vitejs/plugin-react": "^4.3.4",
      typescript: "~5.7.2",
      vite: "^6.1.0",
    },
  },
  null,
  2,
)

vitePreset.files["tsconfig.json"] = JSON.stringify(
  {
    compilerOptions: {
      strict: true,
      esModuleInterop: true,
      jsx: "react-jsx",
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "Bundler",
      baseUrl: ".",
      paths: { "~/*": ["src/*"] },
    },
  },
  null,
  2,
)

vitePreset.files["vite.config.ts"] = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "~": "/src" } }
})`

vitePreset.files["index.html"] = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`

vitePreset.files["src/app.tsx"] = `export function App() {
  return (
    <div>
      <h1>Vite + React</h1>
    </div>
  )
}`

vitePreset.files["src/main.tsx"] = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '~/app.tsx'

const container = document.getElementById("root")

createRoot(container!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`

vitePreset.files["vite-env.d.ts"] = `/// <reference types="vite/client" />`
