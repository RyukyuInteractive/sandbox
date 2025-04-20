import { useChat } from "@ai-sdk/react"
import type { WebContainerProcess } from "@webcontainer/api"
import { createContext, useContext, useRef } from "react"
import type { ReactNode } from "react"
import { useCredentialStorage } from "~/hooks/use-credential-storage"
import { useProject } from "~/hooks/use-project"
import { useShell } from "~/hooks/use-shell"
import { useViews } from "~/hooks/use-views"
import { useWebContainer } from "~/hooks/use-web-container"
import { client } from "~/lib/client"
import { executeCommandTool } from "~/lib/tools/execute-command-tool"
import { readFileTool } from "~/lib/tools/read-file-tool"
import { searchFilesTool } from "~/lib/tools/search-files-tool"
import { writeFileTool } from "~/lib/tools/write-file-tool"

type AIProviderProps = {
  children: ReactNode
  projectId: string
  prompt?: string
}

export type AIContextType = ReturnType<typeof useChat>

const AIContext = createContext<AIContextType | null>(null)

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error("useAI must be used within an AIProvider")
  }
  return context
}

export function AIProvider({ children, projectId, prompt }: AIProviderProps) {
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

  const project = useProject(projectId)
  const [credentialStorage] = useCredentialStorage()
  const webContainer = useWebContainer()
  const view = useViews()
  const shell = useShell()

  const chat = useChat({
    id: project.data.id,
    maxSteps: 128,
    initialInput: prompt,
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
      stateRef.current.isLocked = false
    },
    onError(error) {
      console.error("Error in chat stream:", error)
      view.remove("EDITOR")
      view.remove("TERMINAL")
      stateRef.current.isLocked = false
    },
  })

  return <AIContext.Provider value={chat}>{children}</AIContext.Provider>
}
