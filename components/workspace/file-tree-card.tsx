import { Card } from "~/components/ui/card"
import { FileTreeItem } from "~/components/workspace/file-tree-item"
import { toFileSystemTree } from "~/lib/to-file-system-tree"

type Props = {
  files: Record<string, string>
  onSelectFile(path: string): void
}

export function FileTreeCard(props: Props) {
  return (
    <Card className="w-full flex-1 overflow-hidden px-2">
      <div className="h-full overflow-y-auto py-2">
        <FileTreeItem
          file={toFileSystemTree(props.files)}
          onClick={props.onSelectFile}
        />
      </div>
    </Card>
  )
}
