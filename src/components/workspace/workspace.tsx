import { useChat } from "@ai-sdk/react"
import { type DeepPartial, parsePartialJson } from "@ai-sdk/ui-utils"
import { Terminal } from "@xterm/xterm"
import type { editor } from "monaco-editor-core"
import * as monaco from "monaco-editor-core"
import { useEffect, useRef, useState } from "react"
import type { z } from "zod"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { ChatMessage } from "~/components/workspace/chat-message"
import { MonacoEditor } from "~/components/workspace/monaco-editor"
import { useCredentialStorage } from "~/hooks/use-credential-storage"
import { useWebContainer } from "~/hooks/use-web-container"
import { client } from "~/lib/client"
import { getCurrentAnnotation } from "~/lib/get-current-annotation"
import type { zPart } from "~/lib/parts/part"
import { zPartCode } from "~/lib/parts/part-code"
import { mainTemplate } from "~/lib/templates/main"
import { toAnnotationMessage } from "~/lib/to-annotation-message"
import { toFileSystemTree } from "~/lib/to-file-system-tree"
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

  const [components, setComponents] = useState<string[]>(["TERMINAL"])

  const [currentFilePath, setCurrentFilePath] = useState("src/app.tsx")

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const webContainer = useWebContainer()

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const terminalRef = useRef<HTMLDivElement>(null)

  const chat = useChat({
    async fetch(_, init) {
      if (typeof init?.body !== "string") throw new Error("init is undefined")
      return client.index.$post({
        json: {
          ...JSON.parse(init.body),
          apiKey: credentialStorage.readApiKey(),
          template: "",
          files: stateRef.current.files,
        },
      })
    },
    async onFinish(message) {
      if (message.parts === undefined) return
      const [part] = message.parts
      if (part.type !== "text") return
      const result = zPartCode.parse(JSON.parse(part.text))
      if (result.type === "code") {
        stateRef.current.files["src/app.tsx"] = result.code
        await webContainer.fs.writeFile("src/app.tsx", result.code)
        const newModel = monaco.editor.createModel(result.code, "tsx")
        editorRef.current?.setModel(newModel)
      }
      removeComponent("EDITOR")
      removeComponent("TERMINAL")
      stateRef.current.isLocked = false
    },
    onError(error) {
      console.error("Error in chat stream:", error)
      removeComponent("EDITOR")
      removeComponent("TERMINAL")
      stateRef.current.isLocked = false
    },
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
   * ファイルの変更時には呼び出されない
   */
  const onChangeEditorValue = async (value: string) => {
    if (stateRef.current.isLocked) return
    await webContainer.fs.writeFile(stateRef.current.currentFilePath, value)
  }

  /**
   * ファイルを切り替える
   */
  const onChangeFilePath = async (path: string) => {
    if (editorRef.current === null) return
    stateRef.current.currentFilePath = path
    const text = stateRef.current.files[path]
    const newModel = monaco.editor.createModel(text, "tsx")
    editorRef.current.setModel(newModel)
    setCurrentFilePath(path)
  }

  useEffect(() => {
    if (editorRef.current === null) return
    if (chat.status !== "streaming") return
    const [code = null] = chat.messages
      .map((message) => {
        if (message.role !== "assistant") return null
        if (message.parts === undefined) return null
        if (message.parts.length === 0) return null
        const [part] = message.parts
        if (part.type !== "text") return null
        const json = parsePartialJson(part.text)
        if (json.value === undefined) return null
        const block = json.value as DeepPartial<z.infer<typeof zPart>>
        if (block.type !== "code") return null
        if (block.code === undefined) return null
        return block.code
      })
      .filter((n) => n !== null)
    if (code === null) return
    stateRef.current.files["src/app.tsx"] = code
    const newModel = monaco.editor.createModel(code, "tsx")
    editorRef.current.setModel(newModel)
  }, [chat])

  /**
   * UIの表示を切り替える
   */
  const onToggleComponent = (component: string) => () => {
    setComponents((v) => {
      return v.includes(component)
        ? v.filter((c) => c !== component)
        : [...v, component]
    })
  }

  const addComponent = (component: string) => {
    setComponents((v) => {
      return v.includes(component) ? v : [...v, component]
    })
  }

  const removeComponent = (component: string) => {
    setComponents((v) => {
      return v.includes(component) ? v.filter((c) => c !== component) : v
    })
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    stateRef.current.isLocked = true
    onChangeFilePath("src/app.tsx")
    addComponent("EDITOR")
    addComponent("TERMINAL")
    return chat.handleSubmit(event)
  }

  console.log(chat.messages)

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
            variant={components.includes("EDITOR") ? "default" : "secondary"}
            onClick={onToggleComponent("EDITOR")}
          >
            {"CODE"}
          </Button>
          <Button
            className="h-auto py-1"
            size={"sm"}
            variant={components.includes("TERMINAL") ? "default" : "secondary"}
            onClick={onToggleComponent("TERMINAL")}
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
              hidden: !components.includes("EDITOR"),
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
              hidden: !components.includes("TERMINAL"),
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
