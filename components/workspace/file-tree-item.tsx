import type { FileSystemTree } from "@webcontainer/api"
import { ChevronDownIcon, ChevronRightIcon, FileIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

type Props = {
  depth?: number
  file: FileSystemTree
  onClick(path: string): void
}

export function FileTreeItem(props: Props) {
  const items = Object.keys(props.file)

  const depth = props.depth || 0

  return items.map((path) => {
    const item = props.file[path]
    if ("directory" in item) {
      return (
        <DirectoryItem
          key={path}
          path={path}
          directory={item.directory}
          depth={depth}
          onClick={(nestedPath) => {
            props.onClick(`${path}/${nestedPath}`)
          }}
        />
      )
    }
    return (
      <Button
        key={path}
        className={cn("h-auto w-full justify-start py-1", {
          "pl-4": depth === 1,
          "pl-8": depth === 2,
          "pl-12": depth === 3,
          "pl-16": depth >= 4,
        })}
        variant={"ghost"}
        size={"sm"}
        onClick={() => {
          props.onClick(path)
        }}
      >
        <FileIcon className="mr-2 h-4 w-4" />
        {path}
      </Button>
    )
  })
}

type DirectoryItemProps = {
  path: string
  directory: FileSystemTree
  depth: number
  onClick(path: string): void
}

function DirectoryItem(props: DirectoryItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div key={props.path} className="w-full">
      <Button
        className={cn("h-auto w-full justify-start py-1", {
          "pl-4": props.depth === 1,
          "pl-8": props.depth === 2,
          "pl-12": props.depth === 3,
          "pl-16": props.depth >= 4,
        })}
        variant={"ghost"}
        size={"sm"}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDownIcon className="mr-2 h-4 w-4" />
        ) : (
          <ChevronRightIcon className="mr-2 h-4 w-4" />
        )}
        {props.path}
      </Button>
      {isOpen && (
        <div>
          <FileTreeItem
            file={props.directory}
            depth={props.depth + 1}
            onClick={props.onClick}
          />
        </div>
      )}
    </div>
  )
}
