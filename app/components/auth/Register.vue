<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { fetch: fetchUserSession } = useUserSession()
const { handler } = useRequestErrorHandler.asToast()

const schema = registerSchema

const fields = ref<AuthFormField[]>([
  {
    name: 'name',
    type: 'text',
    label: 'Nome'
  },
  {
    name: 'email',
    type: 'text',
    label: 'Email'
  },
  {
    name: 'password',
    type: 'password',
    label: 'Senha'
  }
])

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  return await $fetch('/auth/token/register', {
    method: 'POST',
    body: payload.data
  }).then(fetchUserSession).catch(handler)
}
</script>

<template>
  <UAuthForm
    :on-submit
    title="Registrar"
    description="Digite suas credenciais para acessar sua conta."
    icon="i-lucide-user"
    :fields="fields"
    :schema
    :separator="{
      icon: 'i-lucide-user'
    }"
  >
    <template #description>
      Já tem uma conta? <ULink to="#" class="text-primary font-medium">Log in</ULink>.
    </template>
  </UAuthForm>
</template>
