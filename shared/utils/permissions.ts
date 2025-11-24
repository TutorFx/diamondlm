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
  }
} as const

export const groupPermissionSchema = z.enum(PERMISSIONS.GROUP)
export const guidePermissionSchema = z.enum(PERMISSIONS.GUIDE)
