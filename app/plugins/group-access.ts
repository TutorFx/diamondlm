export default defineNuxtPlugin(() => {
  addRouteMiddleware('validate-group-access', async (to) => {
    if (import.meta.prerender) {
      return
    }

    const headers = useRequestHeaders(['cookie'])

    const { data: groups } = await useAsyncData('group-access', (_nuxtApp, { signal }) => $fetch<GroupWithUserPermissions[]>('/api/user-groups', { signal, headers }))

    if (!groups.value) {
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const groupSlug = to.params.groupSlug as string
    const hasAccess = groups.value.some(group => group.slug === groupSlug)

    if (!hasAccess && groupSlug !== 'public') {
      return createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      })
    }
  })
})
