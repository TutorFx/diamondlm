export function useModels() {
  const models = [
    'mistral:latest',
    'gpt-oss:20b'
  ]

  const model = useCookie<string>('model', { default: () => 'gemini-2.5-flash-lite' })

  return {
    models,
    model
  }
}
