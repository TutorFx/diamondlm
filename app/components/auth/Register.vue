<script lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

export interface RegisterSlots {
  description: (props?: object) => unknown
}
</script>

<script setup lang="ts">
const slots = defineSlots<RegisterSlots>()

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
    description="Preencha os campos abaixo para prosseguir."
    icon="lucide:user-plus"
    :submit="{ label: 'Entrar' }"
    :fields="fields"
    :schema
  >
    <template v-if="'description' in slots" #description>
      <slot name="description" />
    </template>
  </UAuthForm>
</template>
