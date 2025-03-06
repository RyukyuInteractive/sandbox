export class CredentialStorage {
  get noApiKey() {
    return this.noLocalApiKey && this.noEnvApiKey
  }

  get noEnvApiKey() {
    return import.meta.env.VITE_OPENAI_API_KEY.length === 0
  }

  get noLocalApiKey() {
    const apiKey = localStorage.getItem("openai-api-key")

    return apiKey === null
  }

  readEnvApiKey() {
    return import.meta.env.VITE_OPENAI_API_KEY || null
  }

  readLocalApiKey() {
    return localStorage.getItem("openai-api-key")
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
    localStorage.setItem("openai-api-key", apiKey)
  }
}
