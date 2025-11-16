import { FetchError } from 'ofetch'

export const useRequestErrorHandler = {
  asToast() {
    const toast = useToast()

    function handler(e: unknown) {
      if (e instanceof FetchError) {
        if (e.response?.status === 400) {
          toast.add({
            title: 'Autenticação falhou',
            description: 'Credenciais inválidas.',
            icon: 'i-lucide-alert-circle',
            color: 'error'
          })
        }
      }
    }

    return { handler }
  }
}
