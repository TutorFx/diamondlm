import { createOllama } from 'ollama-ai-provider-v2'

let ollama: ReturnType<typeof createOllama>

export function useOllama() {
  if (!ollama) {
    const config = useRuntimeConfig()
    ollama = createOllama({
      baseURL: config.ollama.baseUrl
    })
  }

  return ollama
}
