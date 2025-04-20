import { Code, Download, Home } from "lucide-react"
import type { editor } from "monaco-editor-core"
import * as monaco from "monaco-editor-core"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { LinkButton } from "~/components/ui/link-button"
import { FileTreeCard } from "~/components/workspace/file-tree-card"
import { MonacoEditor } from "~/components/workspace/monaco-editor"
import { useViews } from "~/hooks/use-views"
import { useWebContainer } from "~/hooks/use-web-container"
import { getExtname } from "~/lib/getExtname"
import { toFileSystemTree } from "~/lib/to-file-system-tree"
import { cn } from "~/lib/utils"

type Props = {
  projectId: string
  files: Record<string, string>
  preSaveFiles: Record<string, string>
  onSave: (files: Record<string, string>) => Promise<void>
  onPreSave: (files: Record<string, string>) => Promise<void>
}

export function StandaloneEditor({
  projectId,
  files,
  preSaveFiles,
  onSave,
  onPreSave,
}: Props) {
  const stateRef = useRef<{
    currentFilePath: string
    isLocked: boolean
    isBusy: boolean
  }>({
    currentFilePath: "src/app.tsx",
    isLocked: false,
    isBusy: false,
  })

  const [currentFilePath, setCurrentFilePath] = useState<string>("src/app.tsx")
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const webContainer = useWebContainer()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const view = useViews()

  useEffect(() => {
    runDevContainer()
  }, [])

  /**
   * コンテナを起動する
   */
  async function runDevContainer() {
    if (webContainer === null) return

    const fileSystemTree = toFileSystemTree(files)
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
      async (event: "rename" | "change", path: string | Uint8Array) => {
        if (typeof path !== "string") return
        const realPath = `${base}${path}`
        if (getExtname(realPath) === "") return
        const file = await webContainer.fs.readFile(realPath)
        const content = new TextDecoder().decode(file)
        await onSave({
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

    await webContainer.spawn("npm", ["install"])
    await webContainer.spawn("npm", ["run", "dev"])
  }

  /**
   * エディタの編集を修正する
   * ファイルの変更時には呼び出されない
   */
  const onChangeEditorValue = (value: string) => {
    if (stateRef.current.isLocked) return
    onPreSave({
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
    let content = preSaveFiles[path]
    if (!content) {
      const file = await webContainer.fs.readFile(path)
      content = new TextDecoder().decode(file)
    }
    const newModel = monaco.editor.createModel(content, getExtname(path))
    editorRef.current?.setModel(newModel)
  }

  /**
   * コードを保存する
   */
  const handleSave = async () => {
    const content = preSaveFiles[currentFilePath]
    if (!content) return
    await webContainer.fs.writeFile(currentFilePath, content)
  }

  return (
    <div className="flex h-svh w-full bg-zinc-900">
      <main className="flex w-full flex-col gap-2 p-2">
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
          <div
            className={cn("absolute inset-0", {
              hidden: !view.state.includes("EDITOR"),
            })}
          >
            <Card className="h-full w-full overflow-hidden border-zinc-800 bg-black p-4">
              <MonacoEditor
                className="h-full w-full"
                initialValue={files[stateRef.current.currentFilePath]}
                editorRef={editorRef}
                onChange={onChangeEditorValue}
                isShowSaveButton={Object.keys(preSaveFiles).includes(
                  currentFilePath,
                )}
                fileName={currentFilePath}
                onSave={handleSave}
              />
            </Card>
          </div>
          <div
            className={cn("absolute top-0 left-0 h-full w-96 p-2 opacity-95", {
              hidden: !view.state.includes("SIDEBAR"),
            })}
          >
            <div className="flex h-full flex-col gap-2">
              <FileTreeCard
                preSaveFiles={preSaveFiles}
                files={files}
                onSelectFile={onSelectFile}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
