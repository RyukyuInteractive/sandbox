import { useState } from "react"

type Value = "EDITOR" | "TERMINAL" | "SIDEBAR"

export function useViews() {
  const [state, setState] = useState<Value[]>(["TERMINAL", "SIDEBAR"])

  const toggle = (component: Value) => () => {
    setState((currentComponents) => {
      return currentComponents.includes(component)
        ? currentComponents.filter((c) => c !== component)
        : [...currentComponents, component]
    })
  }

  const push = (component: Value) => {
    setState((currentComponents) => {
      return currentComponents.includes(component)
        ? currentComponents
        : [...currentComponents, component]
    })
  }

  const remove = (component: Value) => {
    setState((currentComponents) => {
      return currentComponents.includes(component)
        ? currentComponents.filter((c) => c !== component)
        : currentComponents
    })
  }

  return { state, toggle, push, remove } as const
}
