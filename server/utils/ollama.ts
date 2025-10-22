import { createOllama } from 'ollama-ai-provider-v2'

export function useOllama() {
  return createOllama({
    baseURL: 'http://localhost:11434/api'
  })
}
