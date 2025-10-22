export function useModels() {
  const models = [
    'mistral:latest',
    'gpt-oss:20b',
    'qwen2.5:7b',
    'qwen2.5:3b'
  ]

  const model = useCookie<string>('model', { default: () => 'gemini-2.5-flash-lite' })

  return {
    models,
    model
  }
}
