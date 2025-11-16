import argon2 from 'argon2'

export function HashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: 3
  })
}

export function VerifyPassword(password: string, hash: string) {
  return argon2.verify(hash, password)
}
