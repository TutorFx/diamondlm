import { z } from 'zod/v4'

export const PERMISSIONS = {
  GROUP: {
    READ: 'group:read',
    UPDATE: 'group:update',
    DELETE: 'group:delete',
    MANAGE_MEMBERS: 'group:members:manage'
  },
  GUIDE: {
    READ: 'group:guide:read',
    CREATE: 'group:guide:create',
    UPDATE: 'group:guide:update',
    DELETE: 'group:guide:delete'
  },
  USER: {
    GROUP_CREATE: 'group:create'
  }
} as const

export const groupPermissionSchema = z.enum(PERMISSIONS.GROUP)
export const guidePermissionSchema = z.enum(PERMISSIONS.GUIDE)
export const userPermissionSchema = z.enum(PERMISSIONS.USER)

export const groupMemberPermissionUnionSchema = z.union([
  groupPermissionSchema,
  guidePermissionSchema
])

export function permissionsToMap<P extends string>(
  allPermissions: readonly P[],
  activePermissions: readonly P[]
): Record<P, boolean> {
  const activeSet = new Set(activePermissions)

  return allPermissions.reduce((acc, permission) => {
    acc[permission] = activeSet.has(permission)
    return acc
  }, {} as Record<P, boolean>)
}

export function mapToPermissions<P extends string>(
  permissionMap: Record<P, boolean>
): P[] {
  const entries = Object.entries(permissionMap) as [P, boolean][]

  return entries
    .filter(([_, isActive]) => isActive === true)
    .map(([permission]) => permission)
}
