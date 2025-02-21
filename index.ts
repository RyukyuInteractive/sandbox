import { Hono } from "hono"
import type { Env } from "worker-configuration"

const hono = new Hono<{ Bindings: Env }>()

const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>sandbox</title>
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
  </head>
  <body class="dark">
    <div id="app"></div>
  </body>
</html>`

hono.get("*", async (c) => {
  return c.html(html, {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  })
})

export default hono
