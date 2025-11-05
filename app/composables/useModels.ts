export function useModels() {
  const models = [
    'qwen2.5:7b'
  ]

  const model = useCookie<string>('model', { default: () => 'qwen2.5:7b' })

  return {
    models,
    model
  }
}
