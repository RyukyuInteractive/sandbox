import { useChat } from "@ai-sdk/react"
import type { WebContainerProcess } from "@webcontainer/api"
import { Terminal as XTerm } from "@xterm/xterm"
import type { ITerminalInitOnlyOptions, ITerminalOptions } from "@xterm/xterm"
import { Code, Download, Home, Send, Terminal } from "lucide-react"
import type { editor } from "monaco-editor-core"
import * as monaco from "monaco-editor-core"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { LinkButton } from "~/components/ui/link-button"
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
import { getExtname } from "~/lib/getExtname"
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
        view.push("EDITOR")
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
    rows: 12,
    fontSize: 12,
    lineHeight: 1.2,
    cols: 50,
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
        path: string | Uint8Array,
      ) => {
        if (typeof path !== "string") return
        const realPath = `${base}${path}`
        if (getExtname(realPath) === "") return
        const file = await webContainer.fs.readFile(realPath)
        const content = new TextDecoder().decode(file)
        await project.save({
          [realPath]: content,
        })

        if (stateRef.current.currentFilePath === realPath) {
          const currentPosition = editorRef.current?.getPosition()
          editorRef.current?.setValue(content)
          if (!currentPosition) return
          editorRef.current?.setPosition(currentPosition)
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

    await shell.exec("npm install && npm run dev")
  }

  /**
   * エディタの編集を修正する
   * ファイルの変更時には呼び出されない
   */
  const onChangeEditorValue = (value: string) => {
    if (stateRef.current.isLocked) return
    project.preSave({
      [stateRef.current.currentFilePath]: value,
    })
  }

  /**
   * ソースコードのダウンロードをする
   */
  const onDownLoad = async () => {
    const data = await webContainer.export(webContainer.workdir, {
      format: "zip",
      excludes: ["node_modules"],
    })
    const zip = new Blob([data])
    const uri = URL.createObjectURL(zip)
    const link = document.createElement("a")
    link.download = "sample.zip"
    link.href = uri
    link.click()
  }

  /**
   * ファイルを選択する
   */
  const onSelectFile = async (path: string) => {
    stateRef.current.currentFilePath = path
    view.push("EDITOR")
    setCurrentFilePath(path)
    let content = project.preSaveData.files[path]
    if (!content) {
      const file = await webContainer.fs.readFile(path)
      content = new TextDecoder().decode(file)
    }
    const newModel = monaco.editor.createModel(content, getExtname(path))
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

  /**
   * コードを保存する
   */
  const onSave = async () => {
    const content = project.preSaveData.files[currentFilePath]
    if (!content) return
    await webContainer.fs.writeFile(currentFilePath, content)
  }

  const annotation = getCurrentAnnotation(chat.messages)

  return (
    <div className="flex h-svh w-full bg-zinc-900">
      <aside className="flex h-full w-96 min-w-96 flex-col gap-2 p-2">
        <Card className="h-1/2 w-full overflow-hidden rounded-xl border-zinc-800 bg-black">
          <div className="scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700 flex h-full flex-col overflow-hidden">
            <ul className="space-y-2 flex-1 overflow-y-auto p-2 text-zinc-300" ref={(el) => {
                if (el) {
                  el.scrollTop = el.scrollHeight;
                }
              }}>
              {chat.status !== "ready" && (
                <li>
                  <p className="text-xs">{toAnnotationMessage(annotation)}</p>
                </li>
              )}
              {chat.messages?.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </ul>
            <Separator className="bg-zinc-800" />
            <form className="flex gap-2 p-2" onSubmit={onSubmit}>
              <Input
                className="h-8 border-zinc-800 bg-zinc-900/80 text-white placeholder:text-zinc-400"
                value={chat.input}
                placeholder="プロンプトを入力"
                onChange={chat.handleInputChange}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 active:scale-90"
              >
                <Send className="h-6 w-6" />
              </Button>
            </form>
          </div>
        </Card>
        <FileTreeCard
          preSaveFiles={project.preSaveData.files}
          files={project.data.files}
          onSelectFile={onSelectFile}
        />
      </aside>
      <main className="flex flex-1 flex-col gap-2 p-2">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 text-zinc-400 hover:text-zinc-300",
              view.state.includes("EDITOR") &&
                "bg-emerald-500/10 text-emerald-400 hover:text-emerald-300",
            )}
            onClick={view.toggle("EDITOR")}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 text-zinc-400 hover:text-zinc-300",
              view.state.includes("TERMINAL") &&
                "bg-emerald-500/10 text-emerald-400 hover:text-emerald-300",
            )}
            onClick={view.toggle("TERMINAL")}
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-zinc-400 hover:text-emerald-300"
            onClick={onDownLoad}
          >
            <Download className="h-4 w-4" />
          </Button>
          <LinkButton
            to="/"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-zinc-400 hover:text-emerald-300"
          >
            <Home className="h-4 w-4" />
          </LinkButton>
        </div>
        <div className="relative flex flex-1 flex-col">
          <div className="h-full w-full overflow-hidden">
            <Card className="h-full w-full overflow-hidden border-zinc-800 bg-black p-4">
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
            <Card className="h-full w-full overflow-hidden border-zinc-800 bg-black p-4">
              <MonacoEditor
                className="h-full w-full"
                initialValue={
                  project.data.files[stateRef.current.currentFilePath]
                }
                editorRef={editorRef}
                onChange={onChangeEditorValue}
                isShowSaveButton={Object.keys(
                  project.preSaveData.files,
                ).includes(currentFilePath)}
                fileName={currentFilePath}
                onSave={onSave}
              />
            </Card>
          </div>
          <div
            className={cn("absolute right-0 bottom-0 w-full p-2 opacity-90", {
              hidden: !view.state.includes("TERMINAL"),
            })}
          >
            <Card className="overflow-hidden border-zinc-800 bg-black p-4">
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
