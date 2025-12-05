export default defineNuxtPlugin(() => {
  const headers = useRequestHeaders(['cookie'])

  addRouteMiddleware('validate-group-access', async (to, from) => {
    if (import.meta.prerender) {
      return
    }

    const { refresh: refreshLastGroup } = useAsyncData('last-group', (_nuxtApp, { signal }) => $fetch<{ slug: string }>('/api/user/last-group', { cache: 'no-store', signal, headers }))
    const { data: groups } = await useAsyncData('group-access', (_nuxtApp, { signal }) => $fetch<GroupWithUserPermissions[]>('/api/user-groups', { signal, headers }))

    if (!groups.value) {
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const groupSlug = to.params.groupSlug as string | undefined
    const oldGroupSlug = from.params.groupSlug as string | undefined

    const hasAccess = groups.value.some(group => group.slug === groupSlug)

    if (!hasAccess && groupSlug !== 'public') {
      return createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      })
    }

    if (groupSlug && groupSlug !== oldGroupSlug && groupSlug !== 'public') {
      $fetch(
        `/api/user/last-group/${groupSlug}`,
        { headers, method: 'POST' }
      )
      refreshLastGroup()
    }
  })

  addRouteMiddleware('validate-group-list', async () => {
    if (import.meta.prerender) {
      return
    }

    const { data: groups } = await useAsyncData('group-access', (_nuxtApp, { signal }) => $fetch<GroupWithUserPermissions[]>('/api/user-groups', { signal, headers }))

    if (!groups.value) {
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
  })
})
