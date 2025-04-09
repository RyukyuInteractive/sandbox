import type { WebContainerProcess } from "@webcontainer/api"
import { Terminal as XTerm } from "@xterm/xterm"
import type { ITerminalInitOnlyOptions, ITerminalOptions } from "@xterm/xterm"
import { Code, Download, Home, Send, Terminal } from "lucide-react"
import type { editor } from "monaco-editor-core"
import * as monaco from "monaco-editor-core"
import { useEffect, useRef, useState } from "react"
import { AIProvider, useAI } from "~/components/ai/ai-provider"
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
import { useChat } from "@ai-sdk/react"

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
  const [currentFilePath, setCurrentFilePath] = useState<string>("src/app.tsx")
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const webContainer = useWebContainer()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const terminalRef = useRef<XTerm>(null)
  const shell = useShell()
  const terminalComponentRef = useRef<HTMLDivElement>(null)
  const view = useViews()

  return (
    <AIProvider projectId={props.projectId} prompt={props.prompt}>
      <WorkspaceContent
        stateRef={stateRef}
        project={project}
        currentFilePath={currentFilePath}
        setCurrentFilePath={setCurrentFilePath}
        iframeRef={iframeRef}
        webContainer={webContainer}
        editorRef={editorRef}
        terminalRef={terminalRef}
        shell={shell}
        terminalComponentRef={terminalComponentRef}
        view={view}
      />
    </AIProvider>
  )
}

type WorkspaceContentProps = {
  stateRef: React.MutableRefObject<{
    currentFilePath: string
    isLocked: boolean
    devProcess: WebContainerProcess | null
    isBusy: boolean
  }>
  project: ReturnType<typeof useProject>
  currentFilePath: string
  setCurrentFilePath: React.Dispatch<React.SetStateAction<string>>
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  webContainer: ReturnType<typeof useWebContainer>
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>
  terminalRef: React.MutableRefObject<XTerm | null>
  shell: ReturnType<typeof useShell>
  terminalComponentRef: React.RefObject<HTMLDivElement | null>
  view: ReturnType<typeof useViews>
}

function WorkspaceContent({
  stateRef,
  project,
  currentFilePath,
  setCurrentFilePath,
  iframeRef,
  webContainer,
  editorRef,
  terminalRef,
  shell,
  terminalComponentRef,
  view,
}: WorkspaceContentProps) {
  const chat = useAI()
  
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
      {/* チャット部分（左側） */}
      <div className="w-1/3 border-r border-zinc-800 p-2">
        <Card className="h-full w-full overflow-hidden rounded-xl border-zinc-800 bg-black">
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
      </div>

      {/* エディタ部分（右側） */}
      <main className="flex w-2/3 flex-col gap-2 p-2">
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
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 text-zinc-400 hover:text-zinc-300",
              view.state.includes("SIDEBAR") &&
                "bg-emerald-500/10 text-emerald-400 hover:text-emerald-300",
            )}
            onClick={view.toggle("SIDEBAR")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="9" x2="9" y1="3" y2="21" />
            </svg>
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
          {/* エディタ、ターミナル、サイドバーをプレビューの上に重ねる */}
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
            className={cn("absolute right-0 bottom-0 w-2/3 h-1/3 p-2", {
              hidden: !view.state.includes("TERMINAL"),
            })}
          >
            <Card className="h-full w-full overflow-hidden border-zinc-800 bg-black p-4">
              <div
                className="h-full w-full overflow-x-hidden"
                ref={terminalComponentRef}
              />
            </Card>
          </div>
          <div
            className={cn("absolute right-0 top-0 h-2/3 w-64 p-2", {
              hidden: !view.state.includes("SIDEBAR"),
            })}
          >
            <Card className="h-full w-full overflow-hidden rounded-xl border-zinc-800 bg-black">
              <div className="flex flex-col h-full">
                <div className="p-2 border-b border-zinc-800">
                  <LinkButton
                    to="/"
                    variant="ghost"
                    className="w-full justify-start gap-2 text-zinc-300 hover:text-white"
                  >
                    <Home className="h-4 w-4" />
                    <span>ホームに戻る</span>
                  </LinkButton>
                </div>
                <div className="flex-1 overflow-auto">
                  <FileTreeCard
                    className="border-none"
                    preSaveFiles={project.preSaveData.files}
                    files={project.data.files}
                    onSelectFile={onSelectFile}
                  />
                </div>
                <div className="p-2 border-t border-zinc-800">
                  <h3 className="mb-2 text-sm font-semibold text-zinc-400">設定</h3>
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm text-zinc-300 hover:text-white"
                      onClick={() => {
                        console.log("全般設定")
                      }}
                    >
                      <span>全般</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
