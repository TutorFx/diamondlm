import { createOllama } from 'ollama-ai-provider-v2'

export function useOllama() {
  return createOllama({
    baseURL: process.env.OLLAMA_BASE_URL
  })
}
