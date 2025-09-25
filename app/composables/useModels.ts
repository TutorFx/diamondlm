export function useModels() {
  const models = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemma-3-27b-it',
    'gemma-3-12b-it',
    'gemma-3-4b-it',
    'gemma-3-1b-it',
    'gemma-3n-e4b-it',
    'gemma-3n-e2b-it'
  ]

  const model = useCookie<string>('model', { default: () => 'gemini-2.5-flash-lite' })

  return {
    models,
    model
  }
}
