import { WebContainer } from "@webcontainer/api"

let webContainer: WebContainer | null = null

let promise: Promise<WebContainer> | null = null

export function useWebContainer() {
  if (promise === null) {
    promise = initWebContainer()
  }

  if (webContainer !== null) {
    return webContainer
  }

  throw promise
}

async function initWebContainer(): Promise<WebContainer> {
  if (webContainer !== null) return webContainer

  if (import.meta.hot?.data.webcontainer) {
    const container = import.meta.hot.data.webcontainer as WebContainer
    webContainer = container
    return container
  }

  const container = await WebContainer.boot({
    coep: "credentialless",
    workdirName: "projects",
  })

  webContainer = container

  if (import.meta.hot) {
    import.meta.hot.data.webcontainer = container
  }

  return container
}
