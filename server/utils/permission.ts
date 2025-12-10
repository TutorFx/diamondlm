export async function getUserGroupPermissions(db: ReturnType<typeof useDrizzle>, params: { userId: string, groupId: string }): Promise<{ permissions: GroupPermissionMap }> {
  const [userPerms] = await db
    .select({
      permissions: tables.groupMembers.permissions
    })
    .from(tables.groupMembers)
    .where(
      and(
        eq(tables.groupMembers.userId, params.userId),
        eq(tables.groupMembers.groupId, params.groupId)
      )
    )
    .limit(1)

  const allPermissions = [
    ...Object.values(PERMISSIONS.GUIDE),
    ...Object.values(PERMISSIONS.GROUP)
  ] as const

  if (!userPerms) {
    throw createError({ statusCode: 404, statusMessage: 'Permissions not found' })
  }

  return { permissions: permissionsToMap(allPermissions, userPerms.permissions) }
}

export async function setUserGroupPermissions(db: ReturnType<typeof useDrizzle>, params: { userId: string, groupId: string, permissions: GroupPermissionMap }): Promise<{ permissions: GroupPermissionMap }> {
  const [userPerms] = await db
    .update(tables.groupMembers)
    .set({
      permissions: mapToPermissions(params.permissions)
    })
    .where(
      and(
        eq(tables.groupMembers.userId, params.userId),
        eq(tables.groupMembers.groupId, params.groupId)
      )
    ).returning({
      permissions: tables.groupMembers.permissions
    })

  const allPermissions = [
    ...Object.values(PERMISSIONS.GUIDE),
    ...Object.values(PERMISSIONS.GROUP)
  ] as const

  const redis = useRedis()
  await redis.del(`user:${params.userId}:last-group`)

  if (!userPerms) {
    throw createError({ statusCode: 404, statusMessage: 'Member Permissions not found' })
  }

  return { permissions: permissionsToMap(allPermissions, userPerms.permissions) }
}
