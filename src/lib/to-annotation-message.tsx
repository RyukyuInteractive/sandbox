type Props = string | null

export function toAnnotationMessage(annotation: Props) {
  if (annotation === null) {
    return null
  }

  if (annotation === "context-in-progress") {
    return "文脈を考えてます.."
  }

  if (annotation === "in-progress") {
    return "考え中.."
  }

  return null
}
