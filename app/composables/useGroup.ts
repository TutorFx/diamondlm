export function useGroup() {
  const route = useRoute()
  const { data: groups } = useNuxtData<GroupWithUserPermissions[]>('group-access')

  const group = computed<GroupWithUserPermissions | null>(() => {
    const slug = route.params.groupSlug
    if (slug === 'public') return null
    return groups.value?.find(g => g.slug === slug) ?? null
  })

  if (route.params.groupSlug !== 'public') {
    if (!group.value?.id) throw createError({
      statusCode: 404,
      statusMessage: 'Group not found'
    })

    if (!group.value?.permissions.includes(PERMISSIONS.GROUP.READ)) throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }

  return {
    groups,
    group
  }
}
