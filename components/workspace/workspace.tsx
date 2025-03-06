import { useChat } from "@ai-sdk/react"
import { Terminal } from "@xterm/xterm"
import type { editor } from "monaco-editor-core"
import * as monaco from "monaco-editor-core"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { ChatMessage } from "~/components/workspace/chat-message"
import { MonacoEditor } from "~/components/workspace/monaco-editor"
import { useCredentialStorage } from "~/hooks/use-credential-storage"
import { useViews } from "~/hooks/use-views"
import { useWebContainer } from "~/hooks/use-web-container"
import { getCurrentAnnotation } from "~/lib/ai/get-current-annotation"
import { client } from "~/lib/client"
import { mainTemplate } from "~/lib/templates/main"
import { toAnnotationMessage } from "~/lib/to-annotation-message"
import { toFileSystemTree } from "~/lib/to-file-system-tree"
import { toMessageCode } from "~/lib/to-message-code"
import { useChatCode } from "~/lib/use-chat-code"
import { cn } from "~/lib/utils"

type Props = {
  projectId: string
}

export function Workspace(props: Props) {
  const stateRef = useRef({
    files: mainTemplate,
    currentFilePath: "src/app.tsx",
    isLocked: false,
  })

  const [credentialStorage] = useCredentialStorage()

  const [currentFilePath, setCurrentFilePath] = useState("src/app.tsx")

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const webContainer = useWebContainer()

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const terminalRef = useRef<HTMLDivElement>(null)

  const view = useViews()

  const chat = useChat({
    async fetch(_, init) {
      if (typeof init?.body !== "string") throw new Error("init is undefined")
      return client.index.$post({ json: JSON.parse(init.body) })
    },
    experimental_prepareRequestBody(options) {
      return {
        ...options,
        apiKey: credentialStorage.readApiKey(),
        template: "",
        files: stateRef.current.files,
      }
    },
    async onFinish(message) {
      const code = toMessageCode(message)
      if (code === null) return null
      await webContainer.fs.writeFile("src/app.tsx", code)
      stateRef.current.currentFilePath = "src/app.tsx"
      stateRef.current.files["src/app.tsx"] = code
      const newModel = monaco.editor.createModel(code, "tsx")
      editorRef.current?.setModel(newModel)
      view.remove("EDITOR")
      view.remove("TERMINAL")
      stateRef.current.isLocked = false
    },
    onError(error) {
      console.error("Error in chat stream:", error)
      view.remove("EDITOR")
      view.remove("TERMINAL")
      stateRef.current.isLocked = false
    },
  })

  useChatCode(chat, (code) => {
    if (editorRef.current === null) return
    editorRef.current.setValue(code)
  })

  useEffect(() => {
    runDevContainer()
  }, [])

  /**
   * コンテナを起動する
   */
  async function runDevContainer() {
    if (webContainer === null) return

    const terminal = new Terminal({})

    if (terminalRef.current !== null) {
      terminal.open(terminalRef.current)
    }

    const fileSystemTree = toFileSystemTree(stateRef.current.files)

    await webContainer.mount(fileSystemTree)

    const installProcess = await webContainer.spawn("npm", ["install"])

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data)
        },
      }),
    )

    const exitCode = await installProcess.exit

    if (exitCode !== 0) {
      throw new Error("Installation failed")
    }

    const startProcess = await webContainer.spawn("npm", ["run", "dev"])

    startProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data)
        },
      }),
    )

    webContainer.on("server-ready", (port, url) => {
      if (iframeRef.current === null) return
      iframeRef.current.src = url
    })
  }

  /**
   * エディタの編集を修正する
   * ファイルの変更時には呼び出されない
   */
  const onChangeEditorValue = async (value: string) => {
    if (stateRef.current.isLocked) return
    await webContainer.fs.writeFile(stateRef.current.currentFilePath, value)
  }

  /**
   * 送信する
   */
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    stateRef.current.isLocked = true
    view.push("EDITOR")
    view.push("TERMINAL")
    return chat.handleSubmit(event)
  }

  const annotation = getCurrentAnnotation(chat.messages)

  return (
    <div className="flex h-svh w-full">
      <aside className="h-full w-80 min-w-80 py-2 pl-2">
        <Card className="h-full w-full">
          <div className="flex h-full flex-col overflow-hidden">
            <form className="flex gap-x-2 p-2" onSubmit={onSubmit}>
              <Input
                value={chat.input}
                placeholder="なにをしたいですか？"
                onChange={chat.handleInputChange}
              />
              <Button variant={"outline"}>{"送信"}</Button>
            </form>
            <Separator />
            <ul className="space-y-2 overflow-y-scroll p-2">
              {chat.status !== "ready" && (
                <li>
                  <p className="text-xs">{toAnnotationMessage(annotation)}</p>
                </li>
              )}
              {chat.messages?.toReversed().map((message) => (
                <li key={message.id}>
                  <ChatMessage key={message.id} message={message} />
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </aside>
      <main className="flex flex-1 flex-col gap-y-2 p-2">
        <div className="flex gap-x-2">
          <Button
            className="h-auto py-1"
            size={"sm"}
            variant={view.state.includes("EDITOR") ? "default" : "secondary"}
            onClick={view.toggle("EDITOR")}
          >
            {"CODE"}
          </Button>
          <Button
            className="h-auto py-1"
            size={"sm"}
            variant={view.state.includes("TERMINAL") ? "default" : "secondary"}
            onClick={view.toggle("TERMINAL")}
          >
            {"TERMINAL"}
          </Button>
        </div>
        <div className="relative flex flex-1 flex-col">
          <div className="h-full w-full overflow-hidden">
            <Card className="h-full w-full overflow-hidden">
              <iframe
                allow="cross-origin-isolated"
                className={"h-full w-full flex-1"}
                title="preview"
                ref={iframeRef}
              />
            </Card>
          </div>
          <div
            className={cn("absolute h-full w-full", {
              hidden: !view.state.includes("EDITOR"),
            })}
          >
            <Card className="h-full w-full overflow-hidden">
              <MonacoEditor
                className="h-full w-full"
                initialValue={stateRef.current.files[currentFilePath]}
                editorRef={editorRef}
                onChange={onChangeEditorValue}
              />
            </Card>
          </div>
          <div
            className={cn("absolute right-0 bottom-0 w-full p-2", {
              hidden: !view.state.includes("TERMINAL"),
            })}
          >
            <Card className="overflow-hidden p-0 shadow-xl">
              <div
                className="h-40 w-full overflow-x-hidden overflow-y-scroll rounded-md"
                ref={terminalRef}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
