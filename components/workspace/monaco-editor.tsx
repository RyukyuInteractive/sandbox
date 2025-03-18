import { shikiToMonaco } from "@shikijs/monaco"
import * as monaco from "monaco-editor-core"
import { useEffect, useRef } from "react"
import { createHighlighter } from "shiki/bundle/web"
import { debounce } from "~/lib/debounce"

type Props = {
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>
  className: string
  initialValue: string
  onChange(value: string): void
}

export function MonacoEditor(props: Props) {
  const ref = useRef(null)

  useEffect(() => {
    initialize()
  }, [])

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

    const handleChangeModalContent = debounce(() => {
      const value = editor.getValue()
      props.onChange(value)
    }, 500)

    editor.onDidChangeModelContent(handleChangeModalContent)

    props.editorRef.current = editor
  }

  return <div ref={ref} className={props.className} />
}
