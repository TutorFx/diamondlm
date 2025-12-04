<script lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

export interface LoginSlots {
  description: (props?: object) => unknown
}
</script>

<script setup lang="ts">
const slots = defineSlots<LoginSlots>()
const emits = defineEmits<{
  (e: 'submit', payload: FormSubmitEvent<z.infer<typeof schema>>): void
}>()

const { fetch: fetchUserSession } = useUserSession()
const { handler } = useRequestErrorHandler.asToast()

const schema = loginSchema

const fields = ref<AuthFormField[]>([
  {
    name: 'email',
    type: 'text',
    label: 'Email',
    ui: {
      base: 'bg-gray-200/50'
    }
  },
  {
    name: 'password',
    type: 'password',
    label: 'Senha',
    ui: {
      base: 'bg-gray-200/50'
    }
  }
])

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  return await $fetch('/auth/token/login', {
    method: 'POST',
    body: payload.data
  }).then(async () => {
    await fetchUserSession()
    emits('submit', payload)
  }).catch(handler)
}
</script>

<template>
  <UAuthForm
    :on-submit
    description="Entre com seu e-mail e senha."
    :submit="{ label: 'Entrar' }"
    :fields="fields"
    :schema
  >
    <template v-if="'description' in slots" #description>
      <slot name="description" />
    </template>
  </UAuthForm>
</template>
