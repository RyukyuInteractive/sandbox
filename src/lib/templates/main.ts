import { shadcnuiFiles } from "~/hono/lib/files/shadcnui-files"

export const mainTemplate: Record<string, string> = {
  ...shadcnuiFiles,
}

mainTemplate["package.json"] = JSON.stringify(
  {
    name: "sandbox",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
    },
    devDependencies: {
      "@tailwindcss/vite": "^4.0.6",
      "@types/react": "^19.0.8",
      "@types/react-dom": "^19.0.3",
      "@vitejs/plugin-react": "^4.3.2",
      tailwindcss: "^3.4.10",
      "tailwindcss-animate": "^1.0.7",
      typescript: "^5.7.3",
      vite: "^6.0.3",
      postcss: "^8.4.41",
    },
    dependencies: {
      "@hookform/resolvers": "^4.1.0",
      "@radix-ui/react-accordion": "^1.2.3",
      "@radix-ui/react-alert-dialog": "^1.1.6",
      "@radix-ui/react-aspect-ratio": "^1.1.2",
      "@radix-ui/react-avatar": "^1.1.3",
      "@radix-ui/react-checkbox": "^1.1.4",
      "@radix-ui/react-collapsible": "^1.1.3",
      "@radix-ui/react-context-menu": "^2.2.6",
      "@radix-ui/react-dialog": "^1.1.6",
      "@radix-ui/react-dropdown-menu": "^2.1.6",
      "@radix-ui/react-hover-card": "^1.1.6",
      "@radix-ui/react-label": "^2.1.2",
      "@radix-ui/react-menubar": "^1.1.6",
      "@radix-ui/react-navigation-menu": "^1.2.5",
      "@radix-ui/react-popover": "^1.1.6",
      "@radix-ui/react-progress": "^1.1.2",
      "@radix-ui/react-radio-group": "^1.2.3",
      "@radix-ui/react-scroll-area": "^1.2.3",
      "@radix-ui/react-select": "^2.1.6",
      "@radix-ui/react-separator": "^1.1.2",
      "@radix-ui/react-slider": "^1.2.3",
      "@radix-ui/react-slot": "^1.1.2",
      "@radix-ui/react-switch": "^1.1.3",
      "@radix-ui/react-tabs": "^1.1.3",
      "@radix-ui/react-toast": "^1.2.6",
      "@radix-ui/react-toggle": "^1.1.2",
      "@radix-ui/react-toggle-group": "^1.1.2",
      "@radix-ui/react-tooltip": "^1.1.8",
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      cmdk: "^1.0.0",
      "date-fns": "^3.6.0",
      "embla-carousel-react": "^8.5.2",
      "input-otp": "^1.4.2",
      "lucide-react": "^0.475.0",
      "next-themes": "^0.4.4",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      "react-hook-form": "^7.54.2",
      "react-resizable-panels": "^2.1.7",
      "react-day-picker": "^9.5.1",
      recharts: "^2.15.1",
      sonner: "^2.0.0",
      "tailwind-merge": "^3.0.1",
    },
  },
  null,
  2,
)

mainTemplate["tsconfig.json"] = JSON.stringify(
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

mainTemplate["components.json"] = JSON.stringify(
  {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: false,
    tsx: true,
    tailwind: {
      config: "tailwind.config.ts",
      css: "src/main.css",
      baseColor: "zinc",
      cssVariables: true,
      prefix: "",
    },
    aliases: {
      components: "~/components",
      utils: "~/lib/utils",
      ui: "~/components/ui",
      lib: "~/lib",
      hooks: "~/hooks",
    },
    iconLibrary: "lucide",
  },
  null,
  2,
)

mainTemplate["vite.config.ts"] = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "~": "/src" } }
})`

mainTemplate["index.html"] = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>sandbox</title>
  </head>
  <body class="dark">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`

mainTemplate["src/main.css"] = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

body {
  overscroll-behavior-y: none;
}`

mainTemplate["src/main.tsx"] = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '~/app.tsx'

import '~/main.css'

const container = document.getElementById("root")

createRoot(container!).render(<App />)`

mainTemplate["src/app.tsx"] = `import { Button } from "~/components/ui/button"

export function App() {
  return (
    <main className="p-4">
      <Button>{"Hello"}</Button>
    </main>
  )
}`

mainTemplate["src/lib/utils.ts"] = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`

mainTemplate["src/hooks/use-mobile.tsx"] = `import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(\`(max-width: \${MOBILE_BREAKPOINT - 1}px)\`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}`

mainTemplate["tailwind.config.js"] = `import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
  plugins: [animate],
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "index.html"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      }
    },
  },
} satisfies Config`

mainTemplate["postcss.config.js"] = `export default {
  plugins: {
    tailwindcss: {},
  },
}`

mainTemplate["src/hooks/use-mobile.tsx"] = `import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(\`(max-width: \${MOBILE_BREAKPOINT - 1}px)\`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}`
