export const viteTemplate: Record<string, string> = {}

viteTemplate["package.json"] = JSON.stringify(
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

viteTemplate["tsconfig.json"] = JSON.stringify(
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

viteTemplate["vite.config.ts"] = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "~": "/src" } }
})`

viteTemplate["index.html"] = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sandbox</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`

viteTemplate["src/app.tsx"] = `export function App() {
  return (
    <div>
      <h1>Vite + React</h1>
    </div>
  )
}`

viteTemplate["src/main.tsx"] = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '~/app.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`

viteTemplate["vite-env.d.ts"] = `/// <reference types="vite/client" />`
