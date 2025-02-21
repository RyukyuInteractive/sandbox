import { useState } from "react"
import { CredentialStorage } from "~/lib/credential-storage"

export function useCredentialStorage() {
  const [storage, setStorage] = useState(new CredentialStorage())

  const refresh = () => {
    setStorage(new CredentialStorage())
  }

  return [storage, refresh] as const
}
