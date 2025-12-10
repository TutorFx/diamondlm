import type { GroupPermission, GuidePermission } from '~~/shared/types'

export type GroupPermissionMap = ReturnType<typeof permissionsToMap<GroupPermission | GuidePermission>>

export interface GroupPermissions {
  name: string
  id: string
  permissions: GroupPermissionMap
}
