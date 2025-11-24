declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    avatar: string | null
    provider: AuthProvider
    providerId: number | null
  }
}

export {}
