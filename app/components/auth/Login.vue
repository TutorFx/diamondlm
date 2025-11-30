<script lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

export interface LoginSlots {
  description: (props?: object) => unknown
}
</script>

<script setup lang="ts">
const slots = defineSlots<LoginSlots>()

const { fetch: fetchUserSession } = useUserSession()
const { handler } = useRequestErrorHandler.asToast()

const schema = loginSchema

const fields = ref<AuthFormField[]>([
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
  return await $fetch('/auth/token/login', {
    method: 'POST',
    body: payload.data
  }).then(fetchUserSession).catch(handler)
}
</script>

<template>
  <UAuthForm
    :on-submit
    title="Login"
    description="Entre com seu e-mail e senha."
    :submit="{ label: 'Entrar' }"
    icon="lucide:log-in"
    :fields="fields"
    :schema
  >
    <template v-if="'description' in slots" #description>
      <slot name="description" />
    </template>
  </UAuthForm>
</template>
