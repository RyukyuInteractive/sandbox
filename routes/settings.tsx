import { createFileRoute, useRouter } from "@tanstack/react-router"
import { CredentialPage } from "~/components/pages/credential-page"
import { CredentialStorage } from "~/lib/credential-storage"

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
})

function RouteComponent() {
  const credentialStorage = new CredentialStorage()
  const router = useRouter()

  return (
    <CredentialPage
      onRefresh={() => {
        router.history.replace("/")
      }}
      storage={credentialStorage}
    />
  )
}
