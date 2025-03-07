type Props = string | null

/**
 * TODO: 整理する
 */
export function toAnnotationMessage(annotation: Props) {
  if (annotation === null) {
    return null
  }

  if (annotation === "context-in-progress") {
    return "文脈を考えてます.."
  }

  if (annotation === "context-in-tasks") {
    return "ファイルを選んでいます.."
  }

  if (annotation === "context-in-deps") {
    return "必要なコンポーネントを選んでいます.."
  }

  if (annotation === "context-in-code") {
    return "コードを生成しています.."
  }

  return "考え中.."
}
