import { createOllama } from 'ai-sdk-ollama'

let ollama: ReturnType<typeof createOllama>

export function useOllama() {
  if (!ollama) {
    ollama = createOllama({
      baseURL: process.env.OLLAMA_API_KEY
    })
  }

  return ollama
}
