import type {
  ReasoningUIPart,
  SourceUIPart,
  TextUIPart,
  ToolInvocationUIPart,
} from "@ai-sdk/ui-utils"
import { Card } from "~/components/ui/card"
import { executeCommandTool } from "~/lib/tools/execute-command-tool"
import { listFilesTool } from "~/lib/tools/list-files-tool"
import { readFileTool } from "~/lib/tools/read-file-tool"
import { searchFilesTool } from "~/lib/tools/search-files-tool"
import { thinkingTool } from "~/lib/tools/think-tool"
import { writeFileTool } from "~/lib/tools/write-file-tool"

type Props = {
  part: TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart
}

export function AssistantMessage(props: Props) {
  if (props.part.type === "tool-invocation") {
    if (props.part.toolInvocation.state !== "result") {
      return null
    }

    if (props.part.toolInvocation.toolName === "thinking") {
      const tool = thinkingTool()

      const args = tool.parameters.parse(props.part.toolInvocation.args)

      return (
        <Card className="p-4">
          <p className="whitespace-pre-wrap text-xs leading-relaxed">
            {args.message_to_user}
          </p>
        </Card>
      )
    }

    if (props.part.toolInvocation.toolName === "read_file") {
      const tool = readFileTool()

      const args = tool.parameters.parse(props.part.toolInvocation.args)

      return (
        <Card className="p-4">
          <p className="whitespace-pre-wrap text-xs/6">
            {"👀 ファイルを確認しました"}
          </p>
          <p className="whitespace-pre-wrap text-xs">{args.path}</p>
        </Card>
      )
    }

    if (props.part.toolInvocation.toolName === "list_files") {
      const tool = listFilesTool()

      const args = tool.parameters.parse(props.part.toolInvocation.args)

      return (
        <Card className="p-4">
          <p className="whitespace-pre-wrap text-xs/6">
            {"👀 ファイルの一覧を取得しました"}
          </p>
          <p className="whitespace-pre-wrap text-xs/6">{args.path}</p>
        </Card>
      )
    }

    if (props.part.toolInvocation.toolName === "search_files") {
      const tool = searchFilesTool()

      const args = tool.parameters.parse(props.part.toolInvocation.args)

      return (
        <Card className="p-4">
          <p className="whitespace-pre-wrap text-xs/6">
            {"🔍 ファイルの検索を試みました"}
          </p>
          <p className="whitespace-pre-wrap text-xs/6">{args.regex}</p>
        </Card>
      )
    }

    if (props.part.toolInvocation.toolName === "write_to_file") {
      const tool = writeFileTool()

      const args = tool.parameters.parse(props.part.toolInvocation.args)

      return (
        <Card className="p-4">
          <p className="whitespace-pre-wrap text-xs/6">
            {"👀 ファイルを書きました"}
          </p>
          <p className="whitespace-pre-wrap text-xs/6">{args.path}</p>
        </Card>
      )
    }

    if (props.part.toolInvocation.toolName === "execute_command") {
      const tool = executeCommandTool()

      const args = tool.parameters.parse(props.part.toolInvocation.args)

      return (
        <Card className="p-4">
          <p className="whitespace-pre-wrap text-xs/6">
            {"👀 コマンドを実行しました"}
          </p>
          <p className="whitespace-pre-wrap text-xs/6">{args.command}</p>
        </Card>
      )
    }

    return (
      <Card className="p-4">
        <pre>{JSON.stringify(props.part.toolInvocation.args, null, 2)}</pre>
      </Card>
    )
  }

  if (props.part.type === "text") {
    if (props.part.text === "") {
      return null
    }

    return (
      <Card className="p-4">
        <p className="whitespace-pre-wrap text-xs/6">{props.part.text}</p>
      </Card>
    )
  }

  return null
}
