import { z } from 'zod/v4'

export const PERMISSIONS = {
  GROUP: {
    READ: 'group:read',
    UPDATE: 'group:update',
    DELETE: 'group:delete',
    MANAGE_MEMBERS: 'group:members:manage',
    CREATE: 'group:create'
  },
  GUIDE: {
    READ: 'group:guide:read',
    CREATE: 'group:guide:create',
    UPDATE: 'group:guide:update',
    DELETE: 'group:guide:delete'
  },
  USER: {
    ADMIN: 'user:admin'
  }
} as const

export const groupPermissionSchema = z.enum(PERMISSIONS.GROUP)
export const guidePermissionSchema = z.enum(PERMISSIONS.GUIDE)
export const userPermissionSchema = z.enum(PERMISSIONS.USER)
