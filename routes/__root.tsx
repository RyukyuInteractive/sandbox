import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Suspense } from "react"
import { CredentialPage } from "~/components/pages/credential-page"
import { LoadingPage } from "~/components/pages/loading-page"
import { useCredentialStorage } from "~/hooks/use-credential-storage"

export const Route = createRootRoute({
  component: RouteComponent,
})

function RouteComponent() {
  const [storage, refresh] = useCredentialStorage()

  if (storage.noApiKey) {
    return <CredentialPage storage={storage} onRefresh={refresh} />
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <Outlet />
    </Suspense>
  )
}
