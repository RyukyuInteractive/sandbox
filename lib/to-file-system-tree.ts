import type { FileSystemTree } from "@webcontainer/api"

type FileRecord = Record<string, string>

export function toFileSystemTree(records: FileRecord): FileSystemTree {
  let tree: FileSystemTree = {}

  for (const path in records) {
    const parts = path.split("/")
    tree = buildTree(parts, records[path], tree)
  }

  return tree
}

function buildTree(
  parts: string[],
  content: string,
  currentTree: FileSystemTree,
): FileSystemTree {
  const [currentPart, ...restParts] = parts

  // パスが空なら終了する
  if (!currentPart) return currentTree

  if (restParts.length === 0) {
    // 最後のパートならファイルとして追加する
    currentTree[currentPart] = { file: { contents: content } }
    return currentTree
  }

  // ディレクトリが存在しない場合は作成する
  if (!currentTree[currentPart]) {
    currentTree[currentPart] = { directory: {} }
  }

  const nextNode = currentTree[currentPart]

  if ("directory" in nextNode) {
    buildTree(restParts, content, nextNode.directory)
  }

  return currentTree
}
