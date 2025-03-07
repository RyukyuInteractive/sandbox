export class CredentialStorage {
  get noApiKey() {
    return this.noLocalApiKey && this.noEnvApiKey
  }

  get noEnvApiKey() {
    return import.meta.env.VITE_ANTHROPIC_API_KEY.length === 0
  }

  get noLocalApiKey() {
    const apiKey = localStorage.getItem("sandbox.anthropic-api-key")

    return apiKey === null
  }

  readEnvApiKey() {
    return import.meta.env.VITE_ANTHROPIC_API_KEY || null
  }

  readLocalApiKey() {
    return localStorage.getItem("sandbox.anthropic-api-key")
  }

  readApiKey() {
    const localApiKey = this.readLocalApiKey()

    if (localApiKey !== null) {
      return localApiKey
    }

    const envApiKey = this.readEnvApiKey()

    return envApiKey
  }

  writeLocalApiKey(apiKey: string) {
    localStorage.setItem("sandbox.anthropic-api-key", apiKey)
  }
}
