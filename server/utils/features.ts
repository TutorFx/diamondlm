import { defu } from 'defu'

export const useServerFeatures = () => {
  return defu(globalThis.__SERVICES_STATUS__, DEFAULT_FEATURES)
}
