<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'group-scope',
  middleware: 'validate-group-list'
})

const toast = useToast()
const router = useRouter()

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
})

type Schema = z.output<typeof schema>

const state = reactive({
  name: '',
  slug: ''
})

const loading = ref(false)
const form = ref()

watch(() => state.name, (newName) => {
  if (!state.slug || state.slug === stringToSlug(newName.slice(0, -1))) {
    state.slug = stringToSlug(newName)
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const group = await $fetch('/api/groups', {
      method: 'POST',
      body: event.data
    })

    toast.add({
      title: 'Grupo criado com sucesso!',
      description: `O grupo ${group.name} foi criado.`,
      color: 'success'
    })

    // Refresh groups list if needed (assuming there's a global state or just redirect)
    // refreshNuxtData('groups')

    router.push('/') // Redirect to home or the new group page
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    toast.add({
      title: 'Erro ao criar grupo',
      description: error.data?.statusMessage || 'Ocorreu um erro inesperado.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UDashboardPanel>
    <UHeader title="Criar Novo Grupo">
      <template #left>
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          to="/"
        />
      </template>

      <template #right>
        <UColorModeButton />
        <UButton
          label="Criar Grupo"
          :loading="loading"
          color="primary"
          icon="i-lucide-plus"
          @click="form.submit()"
        />
      </template>
    </UHeader>

    <UContainer class="flex-1 flex flex-col items-center justify-center w-full max-w-lg py-12">
      <div class="text-center mb-8">
        <div class="inline-flex p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl mb-4">
          <UIcon name="lucide:users" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Criar Novo Grupo
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Crie um espaço colaborativo para sua equipe
        </p>
      </div>

      <UCard class="w-full shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
        <UForm
          ref="form"
          :schema="schema"
          :state="state"
          class="space-y-6"
          @submit="onSubmit"
        >
          <UFormField label="Nome do Grupo" name="name" required>
            <UInput
              v-model="state.name"
              placeholder="Ex: Marketing Digital"
              icon="lucide:type"
              size="lg"
              autofocus
            />
          </UFormField>

          <UFormField
            label="Identificador (Slug)"
            name="slug"
            required
            help="Usado na URL do grupo. Apenas letras minúsculas, números e hífens."
          >
            <UInput
              v-model="state.slug"
              placeholder="ex: marketing-digital"
              icon="lucide:link"
              size="lg"
            />
          </UFormField>
        </UForm>
      </UCard>
    </UContainer>
  </UDashboardPanel>
</template>
