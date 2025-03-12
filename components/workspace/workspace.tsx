import { useChat } from "@ai-sdk/react"
import { useQuery } from "@tanstack/react-query"
import type { WebContainerProcess } from "@webcontainer/api"
import { Terminal } from "@xterm/xterm"
import type { editor } from "monaco-editor-core"
import * as monaco from "monaco-editor-core"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { ChatMessage } from "~/components/workspace/chat-message"
import { FileTreeCard } from "~/components/workspace/file-tree-card"
import { MonacoEditor } from "~/components/workspace/monaco-editor"
import { useCredentialStorage } from "~/hooks/use-credential-storage"
import { useViews } from "~/hooks/use-views"
import { useWebContainer } from "~/hooks/use-web-container"
import { getCurrentAnnotation } from "~/lib/ai/get-current-annotation"
import { toAnnotationMessage } from "~/lib/ai/to-annotation-message"
import { client } from "~/lib/client"
import { mainTemplate } from "~/lib/templates/main"
import { toFileSystemTree } from "~/lib/to-file-system-tree"
import { executeCommandTool } from "~/lib/tools/execute-command-tool"
import { readFileTool } from "~/lib/tools/read-file-tool"
import { searchFilesTool } from "~/lib/tools/search-files-tool"
import { writeFileTool } from "~/lib/tools/write-file-tool"
import { cn } from "~/lib/utils"

type Props = {
  roomId: string
}

export function Workspace(props: Props) {
  const stateRef = useRef<{
    files: Record<string, string>
    currentFilePath: string
    isLocked: boolean
    devProcess: WebContainerProcess | null
  }>({
    files: mainTemplate,
    currentFilePath: "src/app.tsx",
    isLocked: false,
    devProcess: null,
  })

  const [credentialStorage] = useCredentialStorage()

  const [currentFilePath, setCurrentFilePath] = useState<string>("src/app.tsx")

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const webContainer = useWebContainer()

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const terminalRef = useRef<Terminal>(null)

  const terminalComponentRef = useRef<HTMLDivElement>(null)

  const view = useViews()

  const { data, isPending } = useQuery({
    queryKey: ["fuga", props.roomId],
    queryFn: async () => {
      const res = await client.message[":roomId"].$get({
        param: { roomId: props.roomId },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch messages")
      }

      return res.json()
    },
  })

  const chat = useChat({
    id: props.roomId,
    maxSteps: 128,
    initialMessages: data,
    sendExtraMessageFields: true,
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
    generateId() {
      return crypto.randomUUID()
    },
    async onToolCall(toolInvocation) {
      stateRef.current.isLocked = true

      if (toolInvocation.toolCall.toolName === "read_file") {
        const tool = readFileTool()
        const args = tool.parameters.parse(toolInvocation.toolCall.args)
        const filePath = args.path.replace("~", "src")
        const content = stateRef.current.files[filePath] || null
        return {
          toolCallId: toolInvocation.toolCall.toolCallId,
          result: {
            content: content,
            error: content
              ? `ファイル ${filePath} の内容を読み込みました`
              : "ファイル読み込みエラー",
          },
        }
      }

      if (toolInvocation.toolCall.toolName === "list_files") {
        // const tool = listFilesTool()
        // const args = tool.parameters.parse(toolInvocation.toolCall.args)
        const files = Object.keys(stateRef.current.files)
        return {
          toolCallId: toolInvocation.toolCall.toolCallId,
          result: { files: files },
        }
      }

      if (toolInvocation.toolCall.toolName === "search_files") {
        const tool = searchFilesTool()
        const args = tool.parameters.parse(toolInvocation.toolCall.args)
        const regex = args.regex
        const files = Object.keys(stateRef.current.files).filter((file) => {
          return stateRef.current.files[file].match(new RegExp(regex))
        })
        return {
          toolCallId: toolInvocation.toolCall.toolCallId,
          result: { files: files },
        }
      }

      if (toolInvocation.toolCall.toolName === "write_to_file") {
        const tool = writeFileTool()
        const args = tool.parameters.parse(toolInvocation.toolCall.args)
        const filePath = args.path.replace("~", "src")
        const code = args.content
        if (editorRef.current === null) {
          throw new Error("editorRef is null")
        }
        if (currentFilePath !== args.path) {
          stateRef.current.currentFilePath = args.path
          setCurrentFilePath(args.path)
        }
        stateRef.current.files[filePath] = code
        editorRef.current.setValue(code ?? "")
        const dir = filePath.split("/").slice(0, -1).join("/")
        await webContainer.fs.mkdir(dir, { recursive: true })
        await webContainer.fs.writeFile(filePath, code)
        return {
          toolCallId: toolInvocation.toolCall.toolCallId,
          result: {
            message: `ファイル ${filePath} に書き込みました`,
          },
        }
      }

      if (toolInvocation.toolCall.toolName === "execute_command") {
        const tool = executeCommandTool()
        const args = tool.parameters.parse(toolInvocation.toolCall.args)
        const command = args.command
        const process = await webContainer.spawn(command)
        await process.exit
        return {
          toolCallId: toolInvocation.toolCall.toolCallId,
          result: { ok: true },
        }
      }
    },
    async onFinish(message) {
      console.log("onFinish", message)
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

  useEffect(() => {
    if (isPending || !data) return
    /**
     * 前回のメッセージでのファイルの変更を反映する
     */
    for (const message of data) {
      if (message.role !== "assistant") continue
      const toolInvocations = message.parts?.filter(
        (part) => part.type === "tool-invocation",
      )

      if (!toolInvocations) continue

      for (const { toolInvocation } of toolInvocations) {
        if (toolInvocation.toolName === "write_to_file") {
          stateRef.current.files[toolInvocation.args.path] =
            toolInvocation.args.content
        }

        /**
         * @TODO editorのファイルを書き換えるいい方法が見つからない。。
         */
      }
    }

    runDevContainer()
  }, [isPending, data])

  /**
   * コンテナを起動する
   */
  async function runDevContainer() {
    if (webContainer === null) return

    terminalRef.current = new Terminal({})

    if (terminalComponentRef.current !== null) {
      terminalRef.current.open(terminalComponentRef.current)
    }

    const fileSystemTree = toFileSystemTree(stateRef.current.files)

    await webContainer.mount(fileSystemTree)

    const installProcess = await webContainer.spawn("npm", ["install"])

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminalRef.current?.write(data)
        },
      }),
    )

    const exitCode = await installProcess.exit

    if (exitCode !== 0) {
      throw new Error("Installation failed")
    }

    stateRef.current.devProcess = await webContainer.spawn("npm", [
      "run",
      "dev",
    ])

    stateRef.current.devProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminalRef.current?.write(data)
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
    stateRef.current.files[stateRef.current.currentFilePath] = value
    await webContainer.fs.writeFile(stateRef.current.currentFilePath, value)
  }

  /**
   * ファイルを選択する
   */
  const onSelectFile = (path: string) => {
    stateRef.current.currentFilePath = path
    setCurrentFilePath(path)
    const extension = path.split(".").pop()
    const content = stateRef.current.files[path] || ""
    const newModel = monaco.editor.createModel(content, extension)
    editorRef.current?.setModel(newModel)
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
      <aside className="flex h-full w-80 min-w-80 flex-col gap-y-2 py-2 pl-2">
        <Card className="h-1/2 w-full overflow-hidden">
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
                <ChatMessage key={message.id} message={message} />
              ))}
            </ul>
          </div>
        </Card>
        <FileTreeCard
          files={stateRef.current.files}
          onSelectFile={onSelectFile}
        />
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
                ref={terminalComponentRef}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
