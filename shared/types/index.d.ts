import type { GroupMember, Group } from '@@/server/utils/drizzle'

export type GroupWithUserPermissions = Group & {
  permissions: GroupMember['permissions']
}

export type ValueOf<T> = T[keyof T];

export type GroupPermission = ValueOf<typeof PERMISSIONS.GROUP>;
export type GuidePermission = ValueOf<typeof PERMISSIONS.GUIDE>;
export type GroupMemberPermission = GroupPermission | GuidePermission;