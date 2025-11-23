import { z } from 'zod/v4'
import type { NewUser } from '@@/server/utils/drizzle'

export const email = z.email({ message: 'Email inválido' })
export const name = z.string('Nome inválido').min(3, 'Nome inválido')
export const password = z.string('Senha inválida').min(1, 'Senha inválida')

export const loginSchema = z.object({
  email,
  password
})

export const registerSchema = z.object({
  email,
  password,
  name
}) satisfies z.ZodSchema<
  Omit<NewUser, 'provider' | 'providerId'>
>
