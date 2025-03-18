import { useChat } from "@ai-sdk/react"
import type { WebContainerProcess } from "@webcontainer/api"
import { Terminal as XTerm } from "@xterm/xterm"
import type { ITerminalInitOnlyOptions, ITerminalOptions } from "@xterm/xterm"
import { Code, Home, Send, Terminal } from "lucide-react"
import type { editor } from "monaco-editor-core"
import * as monaco from "monaco-editor-core"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { LinkButtonComponent } from "~/components/ui/link-button"
import { Separator } from "~/components/ui/separator"
import { ChatMessage } from "~/components/workspace/chat-message"
import { FileTreeCard } from "~/components/workspace/file-tree-card"
import { MonacoEditor } from "~/components/workspace/monaco-editor"
import { useCredentialStorage } from "~/hooks/use-credential-storage"
import { useProject } from "~/hooks/use-project"
import { useShell } from "~/hooks/use-shell"
import { useViews } from "~/hooks/use-views"
import { useWebContainer } from "~/hooks/use-web-container"
import { getCurrentAnnotation } from "~/lib/ai/get-current-annotation"
import { toAnnotationMessage } from "~/lib/ai/to-annotation-message"
import { client } from "~/lib/client"
import { toFileSystemTree } from "~/lib/to-file-system-tree"
import { executeCommandTool } from "~/lib/tools/execute-command-tool"
import { readFileTool } from "~/lib/tools/read-file-tool"
import { searchFilesTool } from "~/lib/tools/search-files-tool"
import { writeFileTool } from "~/lib/tools/write-file-tool"
import { cn } from "~/lib/utils"

type Props = {
  projectId: string
  prompt?: string
}

export function Workspace(props: Props) {
  const stateRef = useRef<{
    currentFilePath: string
    isLocked: boolean
    devProcess: WebContainerProcess | null
    isBusy: boolean
  }>({
    currentFilePath: "src/app.tsx",
    isLocked: false,
    devProcess: null,
    isBusy: false,
  })

  const project = useProject(props.projectId)

  const [credentialStorage] = useCredentialStorage()

  const [currentFilePath, setCurrentFilePath] = useState<string>("src/app.tsx")

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const webContainer = useWebContainer()

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const terminalRef = useRef<XTerm>(null)

  const shell = useShell()

  const terminalComponentRef = useRef<HTMLDivElement>(null)

  const view = useViews()

  const chat = useChat({
    id: project.data.id,
    maxSteps: 128,
    initialInput: props.prompt,
    initialMessages: project.data.messages,
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
        files: project.data.files,
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
        const content = project.data.files[filePath] || null
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
        const files = Object.keys(project.data.files)
        return {
          toolCallId: toolInvocation.toolCall.toolCallId,
          result: { files: files },
        }
      }

      if (toolInvocation.toolCall.toolName === "search_files") {
        const tool = searchFilesTool()
        const args = tool.parameters.parse(toolInvocation.toolCall.args)
        const regex = args.regex
        const files = Object.keys(project.data.files).filter((file) => {
          return project.data.files[file].match(new RegExp(regex))
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
        await shell.exit()
        await shell.exec(command)
        return {
          toolCallId: toolInvocation.toolCall.toolCallId,
          result: { ok: true },
        }
      }
    },
    async onFinish(message) {
      console.log("onFinish", message)
      // view.remove("EDITOR")
      // view.remove("TERMINAL")
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
    runDevContainer()

    return () => {
      shell.kill()
      /**
       * terminalが複数回生成されるのを防ぐ
       */
      terminalRef.current?.dispose()
    }
  }, [shell.kill])

  const terminalOptions = {
    rows: 10,
    fontSize: 12,
    lineHeight: 1.2,
    cols: 300,
    cursorBlink: true,
    cursorStyle: "underline",
  } satisfies ITerminalOptions & ITerminalInitOnlyOptions

  /**
   * コンテナを起動する
   */
  async function runDevContainer() {
    if (webContainer === null) return

    terminalRef.current = new XTerm(terminalOptions)

    if (terminalComponentRef.current !== null) {
      terminalRef.current.open(terminalComponentRef.current)
    }

    const fileSystemTree = toFileSystemTree(project.data.files)

    await webContainer.mount(fileSystemTree)

    webContainer.on("server-ready", (port, url) => {
      if (iframeRef.current === null) return
      iframeRef.current.src = url
    })

    webContainer.on("port", (port, type) => {
      /**
       * serverを修了した際に、websocketによる通信を切断する
       */
      if (iframeRef.current && type === "close") {
        iframeRef.current.src = ""
      }
    })

    const handleWatch =
      (base: string) =>
      async (
        event: "rename" | "change",
        path: string | Uint8Array<ArrayBufferLike>,
      ) => {
        if (event !== "change" || typeof path !== "string") return
        const prevVersion = editorRef.current?.getModel()?.getVersionId()
        const realPath = `${base}${path}`
        const file = await webContainer.fs.readFile(realPath)
        const content = new TextDecoder().decode(file)
        await project.update({
          files: {
            [realPath]: content,
          },
        })
        const currentVersion = editorRef.current?.getModel()?.getVersionId()
        if (
          stateRef.current.currentFilePath === realPath &&
          prevVersion === currentVersion &&
          content !== editorRef.current?.getValue()
        ) {
          editorRef.current?.setValue(content)
        }
      }

    /**
     * webContainerのファイルの変更を監視しファイルツリーを更新する
     */
    webContainer.fs.watch("/", handleWatch(""))
    webContainer.fs.watch(
      "/src",
      {
        recursive: true,
      },
      handleWatch("src/"),
    )

    await shell.init(webContainer, terminalRef.current)

    await shell.exec("ls")

    await shell.exec("npm install")

    await shell.exec("npm run dev")
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
   * ファイルを選択する
   */
  const onSelectFile = async (path: string) => {
    stateRef.current.currentFilePath = path
    setCurrentFilePath(path)
    const extension = path.split(".").pop()
    const file = await webContainer.fs.readFile(path)
    const content = new TextDecoder().decode(file)
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
                className="h-8 border-zinc-800 bg-zinc-900/80 text-white placeholder:text-zinc-400"
                value={chat.input}
                placeholder="プロンプトを入力"
                onChange={chat.handleInputChange}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-400 transition-all hover:rotate-[-15deg] hover:scale-110 hover:bg-emerald-500/10 hover:text-emerald-300 active:scale-90"
              >
                <Send className="h-6 w-6" />
              </Button>
            </form>
            <Separator className="bg-zinc-800" />
            <ul className="space-y-2 overflow-y-auto p-3 text-zinc-300">
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
        <FileTreeCard files={project.data.files} onSelectFile={onSelectFile} />
      </aside>
      <main className="flex flex-1 flex-col gap-y-4 p-4">
        <div className="flex gap-x-4">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 text-zinc-400 transition-all duration-200 hover:rotate-6 hover:scale-110",
              view.state.includes("EDITOR") &&
                "bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:text-emerald-300",
            )}
            onClick={view.toggle("EDITOR")}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "hover:-rotate-6 h-8 w-8 text-zinc-400 transition-all duration-200 hover:scale-110",
              view.state.includes("TERMINAL") &&
                "bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:text-emerald-300",
            )}
            onClick={view.toggle("TERMINAL")}
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <LinkButtonComponent
            to="/"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-zinc-400 transition-all duration-200 hover:rotate-6 hover:scale-110 hover:text-emerald-300"
          >
            <Home className="h-4 w-4" />
          </LinkButtonComponent>
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
                initialValue={
                  project.data.files[stateRef.current.currentFilePath]
                }
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
