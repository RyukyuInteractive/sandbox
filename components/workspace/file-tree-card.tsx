import { Card } from "~/components/ui/card"
import { FileTreeItem } from "~/components/workspace/file-tree-item"
import { toFileSystemTree } from "~/lib/to-file-system-tree"

type Props = {
  files: Record<string, string>
  onSelectFile(path: string): void
}

export function FileTreeCard(props: Props) {
  return (
    <Card className="w-full flex-1 overflow-hidden rounded-xl border-zinc-800 bg-black/20">
      <div className="h-full overflow-y-auto p-4 text-zinc-300">
        <FileTreeItem
          file={toFileSystemTree(props.files)}
          onClick={props.onSelectFile}
        />
      </div>
    </Card>
  )
}
