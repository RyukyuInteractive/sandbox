import { useChat } from "@ai-sdk/react"
import { useQuery } from "@tanstack/react-query"
import type { WebContainerProcess } from "@webcontainer/api"
import type { SpawnOptions } from "@webcontainer/api"
import { Terminal as XTerm } from "@xterm/xterm"
import type { ITerminalInitOnlyOptions, ITerminalOptions } from "@xterm/xterm"
import { Code, Send, Terminal } from "lucide-react"
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

  const terminalRef = useRef<XTerm>(null)

  const terminalComponentRef = useRef<HTMLDivElement>(null)

  const view = useViews()

  const { data, isPending } = useQuery({
    queryKey: ["message", props.roomId],
    queryFn: async () => {
      const res = await client.message[":roomId"].$get({
        param: { roomId: props.roomId },
      })

      return await res.json()
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
    return () => {
      /**
       * terminalが複数回生成されるのを防ぐ
       */
      terminalRef.current?.dispose()
    }
  }, [isPending, data])

  const terminalOptions = {
    rows: 10,
    fontSize: 12,
    lineHeight: 1.2,
    cols: 300,
    cursorBlink: true,
    cursorStyle: "underline",
  } satisfies ITerminalOptions & ITerminalInitOnlyOptions

  const spawnOptions = {
    terminal: {
      cols: terminalOptions.cols,
      rows: terminalOptions.rows,
    },
  } satisfies SpawnOptions

  /**
   * コンテナを起動する
   */
  async function runDevContainer() {
    if (webContainer === null) return

    terminalRef.current = new XTerm(terminalOptions)

    if (terminalComponentRef.current !== null) {
      terminalRef.current.open(terminalComponentRef.current)
    }

    const fileSystemTree = toFileSystemTree(stateRef.current.files)

    await webContainer.mount(fileSystemTree)

    const installProcess = await webContainer.spawn(
      "npm",
      ["install"],
      spawnOptions,
    )

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

    stateRef.current.devProcess = await webContainer.spawn(
      "npm",
      ["run", "dev"],
      spawnOptions,
    )

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
    <div className="flex h-svh w-full bg-gradient-to-b from-zinc-900 via-gray-900 to-black">
      <aside className="flex h-full w-96 min-w-96 flex-col gap-y-4 px-3 py-4">
        <Card className="h-1/2 w-full overflow-hidden rounded-xl border-zinc-800 bg-black/20">
          <div className="scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700 flex h-full flex-col overflow-hidden">
            <form className="flex gap-x-2 p-4" onSubmit={onSubmit}>
              <Input
                className="border-zinc-800 bg-zinc-900/80 text-white placeholder:text-zinc-400"
                value={chat.input}
                placeholder="プロンプトを入力"
                onChange={chat.handleInputChange}
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-emerald-400 transition-all hover:rotate-[-15deg] hover:scale-110 hover:bg-emerald-500/10 hover:text-emerald-300 active:scale-90"
              >
                <Send className="h-6 w-6" />
              </Button>
            </form>
            <Separator className="bg-zinc-800" />
            <ul className="space-y-2 overflow-y-auto p-4 text-zinc-300">
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
      <main className="flex flex-1 flex-col gap-y-4 p-4">
        <div className="flex gap-x-4">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-10 w-10 text-zinc-400 transition-all duration-200 hover:rotate-6 hover:scale-110",
              view.state.includes("EDITOR") &&
                "bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:text-emerald-300",
            )}
            onClick={view.toggle("EDITOR")}
          >
            <Code className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "hover:-rotate-6 h-10 w-10 text-zinc-400 transition-all duration-200 hover:scale-110",
              view.state.includes("TERMINAL") &&
                "bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:text-emerald-300",
            )}
            onClick={view.toggle("TERMINAL")}
          >
            <Terminal className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative flex flex-1 flex-col">
          <div className="h-full w-full overflow-hidden">
            <Card className="h-full w-full overflow-hidden border-zinc-800 bg-black/30">
              <iframe
                allow="cross-origin-isolated"
                className="h-full w-full flex-1"
                title="preview"
                ref={iframeRef}
              />
            </Card>
          </div>
          <div
            className={cn("absolute inset-0", {
              hidden: !view.state.includes("EDITOR"),
            })}
          >
            <Card className="h-full w-full overflow-hidden border-zinc-800 bg-black/50">
              <MonacoEditor
                className="h-full w-full"
                initialValue={stateRef.current.files[currentFilePath]}
                editorRef={editorRef}
                onChange={onChangeEditorValue}
              />
            </Card>
          </div>
          <div
            className={cn("absolute right-0 bottom-0 w-full p-2 opacity-90", {
              hidden: !view.state.includes("TERMINAL"),
            })}
          >
            <Card className="overflow-hidden border-zinc-800 bg-black p-2 ">
              <div
                className="h-full w-full overflow-x-hidden"
                ref={terminalComponentRef}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
