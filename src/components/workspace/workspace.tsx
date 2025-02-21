import { experimental_useObject as useObject } from "@ai-sdk/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Terminal } from "@xterm/xterm"
import type { editor } from "monaco-editor-core"
import * as monaco from "monaco-editor-core"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { ChatMessageItem } from "~/components/workspace/chat-message-item"
import { MonacoEditor } from "~/components/workspace/monaco-editor"
import { useCredentialStorage } from "~/hooks/use-credential-storage"
import { useWebContainer } from "~/hooks/use-web-container"
import { client } from "~/lib/client"
import { mainTemplate } from "~/lib/templates/main"
import { toFileSystemTree } from "~/lib/to-file-system-tree"
import { cn } from "~/lib/utils"
import { zAssistantStream } from "~/lib/validations/assistant-stream"

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

  const [input, setInput] = useState("")

  const query = useQuery({
    queryKey: [client.messages.$url()],
    async queryFn() {
      const resp = await client.messages.$get()
      return resp.json()
    },
  })

  const mutation = useMutation({
    async mutationFn() {
      const resp = await client.messages.$post({
        json: { text: input },
      })
      return resp.json()
    },
  })

  const objectStream = useObject({
    api: "",
    schema: zAssistantStream,
    fetch(_, init) {
      return client.index.$post({
        json: {
          files: stateRef.current.files,
          template: "SHADCN_UI",
          apiKey: credentialStorage.readLocalApiKey(),
        },
      })
    },
    async onFinish(event) {
      if (!stateRef.current.isLocked) return
      stateRef.current.isLocked = false
      for (const node of event.object ?? []) {
        if (node.type === "code") {
          stateRef.current.files["src/app.tsx"] = node.content.code
          await webContainer.fs.writeFile("src/app.tsx", node.content.code)
          const newModel = monaco.editor.createModel(node.content.code, "tsx")
          editorRef.current?.setModel(newModel)
        }
      }
      query.refetch()
    },
    onError(error) {
      console.error("Error in chat stream:", error)
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

  /**
   * メッセージを送信する
   */
  const onSubmit = async () => {
    if (stateRef.current.isLocked) return
    stateRef.current.isLocked = true
    await mutation.mutateAsync()
    await query.refetch()
    objectStream.submit({})
    setInput("")
  }

  const streamMessages = objectStream.isLoading
    ? objectStream.object?.filter((node) => {
        return node !== undefined
      })
    : []

  const messages = [
    ...(query.data ?? []),
    ...(streamMessages ?? []),
  ].toReversed()

  return (
    <div className="flex h-svh w-full">
      <aside className="h-full w-80 min-w-80 py-2 pl-2">
        <Card className="h-full w-full">
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex gap-x-2 p-2">
              <Input
                value={input}
                placeholder="なにをしたいですか？"
                onChange={(event) => {
                  setInput(event.target.value)
                }}
              />
              <Button variant={"outline"} onClick={onSubmit}>
                {"送信"}
              </Button>
            </div>
            <Separator />
            <ul className="space-y-2 overflow-y-scroll p-2">
              {messages?.map((node, index) => (
                <li key={index.toFixed()}>
                  <ChatMessageItem node={node} />
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
