export const useFeatures = () => {
  const config = useRuntimeConfig()
  const servicesState = useState<ServicesStatus | undefined>('services-status')

  return {
    ...config.public.features,
    ...servicesState.value
  }
}
