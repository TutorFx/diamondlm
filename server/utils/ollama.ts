import { createOllama } from 'ollama-ai-provider-v2'

let ollama: ReturnType<typeof createOllama>

export function useOllama() {
  if (!ollama) {
    ollama = createOllama({
      baseURL: process.env.OLLAMA_BASE_URL
    })
  }

  return ollama
}
