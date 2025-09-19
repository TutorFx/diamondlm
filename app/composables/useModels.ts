export function useModels() {
  const models = [
    'gemini-2.5-pro',
    'gemini-2.5-flash'
  ]

  const model = useCookie<string>('model', { default: () => 'gemini-2.5-pro' })

  return {
    models,
    model
  }
}
