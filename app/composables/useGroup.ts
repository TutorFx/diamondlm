export function useGroup() {
  const route = useRoute()

  const groupSlug = route.params.groupSlug as string

  const { data: groups } = useNuxtData<GroupWithUserPermissions[]>('group-access')

  const group = computed<GroupWithUserPermissions>(() => groups.value!.find(group => group.slug === groupSlug)!)

  if (!group.value.id) throw createError({
    statusCode: 404,
    statusMessage: 'Group not found'
  })

  if (!group.value.permissions.includes(PERMISSIONS.GROUP.READ)) throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden'
  })

  return {
    groups,
    group
  }
}