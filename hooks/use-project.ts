import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { client } from "~/lib/client"
import type { Project } from "~/types/workspace"

export function useProject(projectId: string) {
  const endPoint = client.projects[":project"]
  const queryKey = [endPoint.$url({ param: { project: projectId } })]

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

  return {
    data: projectQuery.data,
    update: projectMutation.mutateAsync,
  }
}
