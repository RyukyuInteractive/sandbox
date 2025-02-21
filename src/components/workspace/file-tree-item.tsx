import type { FileSystemTree } from "@webcontainer/api"
import { ChevronDownIcon, FileIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

type Props = {
  isNested?: boolean
  file: FileSystemTree
  onClick(path: string): void
}

export function FileTreeItem(props: Props) {
  const items = Object.keys(props.file)

  return items.map((path) => {
    const item = props.file[path]

    if ("directory" in item) {
      return (
        <div key={path} className="w-full">
          <Button
            className="h-auto w-full justify-start py-1"
            variant={"ghost"}
            size={"sm"}
          >
            <ChevronDownIcon className="h-4 w-4" />
            {path}
          </Button>
          <FileTreeItem
            file={item.directory}
            isNested
            onClick={(nestedPath) => {
              props.onClick(`${path}/${nestedPath}`)
            }}
          />
        </div>
      )
    }

    return (
      <Button
        key={path}
        className={cn("h-auto w-full justify-start py-1", {
          "pl-6": props.isNested,
        })}
        variant={"ghost"}
        size={"sm"}
        onClick={() => {
          props.onClick(path)
        }}
      >
        <FileIcon className="h-4 w-4" />
        {path}
      </Button>
    )
  })
}
