export default defineNuxtPlugin(async () => {
  const servicesStatus = globalThis.__SERVICES_STATUS__

  // Hydrate state for client
  useState<ServicesStatus | undefined>('services-status', () => servicesStatus)
})
