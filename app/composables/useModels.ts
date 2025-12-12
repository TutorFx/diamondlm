export function useModels() {
  const models = [
    'qwen3:8b'
  ]

  const model = useCookie<string>('model', { default: () => 'qwen3:8b' })

  return {
    models,
    model
  }
}
