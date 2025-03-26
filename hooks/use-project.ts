import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useState } from "react"
import { client } from "~/lib/client"
import type { Project } from "~/types/workspace"

export function useProject(projectId: string) {
  const endPoint = client.projects[":project"]
  const queryKey = [endPoint.$url({ param: { project: projectId } })]

  const [preSaveData, setPreSaveData] = useState<{
    files: Record<string, string>
  }>({ files: {} })

  const queryClient = useQueryClient()

  const projectQuery = useSuspenseQuery<Project>({
    queryKey,
    queryFn: async () => {
      const response = await endPoint.$get({
        param: { project: projectId },
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text)
      }

      const json = await response.json()

      return json as never
    },
  })

  const projectMutation = useMutation({
    mutationFn: async (props: {
      files: Record<string, string>
    }) => {
      const response = await endPoint.$put({
        param: { project: projectId },
        json: {
          files: { ...projectQuery.data.files, ...props.files },
        },
      })

      const json = await response.json()

      return json as never
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data)
    },
  })

  const save = async (files: Record<string, string>) => {
    await projectMutation.mutateAsync({ files })
    // 変更中のファイルを削除
    setPreSaveData((prev) => ({
      files: Object.fromEntries(
        Object.entries(prev.files).filter(
          ([key]) => !Object.keys(files).includes(key),
        ),
      ),
    }))
  }

  const preSave = async (files: Record<string, string>) => {
    // フィルタリングして変更があるファイルと変更がないファイルを分ける
    const changedFiles: Record<string, string> = {}
    const unchangedFiles: Set<string> = new Set()

    const projectFiles = projectQuery.data.files
    // 変更があるファイルと変更がないファイルを識別
    for (const [key, value] of Object.entries(files)) {
      if (projectFiles[key] !== value) {
        // 変更があるファイルを保持
        changedFiles[key] = value
      } else {
        // 変更がないファイルのキーを記録
        unchangedFiles.add(key)
      }
    }

    setPreSaveData((prev) => {
      // 前回のファイルから「変更がないファイル」と一致するキーを除外
      const filteredPrevFiles = Object.fromEntries(
        Object.entries(prev.files).filter(([key]) => !unchangedFiles.has(key)),
      )

      return {
        files: {
          ...filteredPrevFiles,
          ...changedFiles,
        },
      }
    })
  }

  return {
    data: projectQuery.data,
    preSaveData,
    save,
    preSave,
  }
}
