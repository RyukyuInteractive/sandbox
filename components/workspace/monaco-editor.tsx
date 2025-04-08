import { shikiToMonaco } from "@shikijs/monaco"
import { Save } from "lucide-react"
import * as monaco from "monaco-editor-core"
import type { IDisposable } from "monaco-editor-core"
import { useEffect, useRef, useState } from "react"
import { createHighlighter } from "shiki/bundle/web"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  onSave(): void
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>
  className: string
  initialValue: string
  fileName: string
  isShowSaveButton: boolean
  onChange(value: string): void
}

export function MonacoEditor(props: Props) {
  const ref = useRef(null)
  const onKeyDispose = useRef<IDisposable>(null)
  const onSaveDispose = useRef<IDisposable>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (!isInitialized || !props.editorRef.current) return
    onKeyDispose.current = props.editorRef.current.onKeyUp(
      (event: monaco.IKeyboardEvent) => {
        const value = props.editorRef.current?.getValue()
        props.onChange(value ?? "")
      },
    )
    return () => {
      onKeyDispose.current?.dispose()
    }
  }, [props.onChange, props.editorRef.current, isInitialized])

  useEffect(() => {
    if (!isInitialized || !props.editorRef.current) return
    onSaveDispose.current = props.editorRef.current.onKeyDown(
      (event: monaco.IKeyboardEvent) => {
        if (
          (event.metaKey || event.ctrlKey) &&
          event.keyCode === monaco.KeyCode.KeyS
        ) {
          event.preventDefault()
          props.onSave()
        }
      },
    )
    return () => {
      onSaveDispose.current?.dispose()
    }
  }, [props.onSave, props.editorRef.current, isInitialized])

  const initialize = async () => {
    if (ref.current === null) return

    if (props.editorRef.current !== null) return

    const langs = ["tsx", "css", "ts", "js", "json"]

    const highlighter = await createHighlighter({
      themes: ["github-dark", "vitesse-light"],
      langs,
    })

    for (const lang of langs) {
      monaco.languages.register({ id: lang })
    }

    shikiToMonaco(highlighter, monaco)

    const editor = monaco.editor.create(ref.current, {
      value: props.initialValue,
      language: "tsx",
      theme: "github-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      padding: { top: 16, bottom: 16 },
      folding: false,
      scrollBeyondLastLine: false,
    })

    props.editorRef.current = editor

    setIsInitialized(true)
  }

  return (
    <Card className="flex h-full flex-col">
      <div className="flex min-h-6 items-center gap-2 border-zinc-800/80 border-b bg-zinc-950/50 p-2">
        <div className="flex flex-1 items-center gap-2">
          <p className="font-medium text-sm text-zinc-300">{props.fileName}</p>
        </div>
        {props.isShowSaveButton && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-auto rounded-sm px-2 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            onClick={props.onSave}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        )}
      </div>
      <CardContent className="flex-1 p-0">
        <div ref={ref} className={props.className} />
      </CardContent>
    </Card>
  )
}
