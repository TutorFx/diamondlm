<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  middleware: ['authed']
})

const input = ref('')
const loading = ref(false)

const { model } = useModels()
const { isListening, isSupported, toggle } = useMic({
  onResult: (text) => {
    input.value = input.value ? `${input.value} ${text}` : text
    debouncedFn()
  }
})

const debouncedFn = useDebounceFn(() => {
  if (input.value.trim()) {
    createChat(input.value)
    input.value = ''
  }
}, 3000)

async function createChat(prompt: string) {
  input.value = prompt
  loading.value = true
  const chat = await $fetch('/api/chats', {
    method: 'POST',
    body: { input: prompt }
  })

  refreshNuxtData('chats')
  navigateTo(`/chat/${chat?.id}`)
}

function onSubmit() {
  createChat(input.value)
}

const quickChats = [
  {
    label: 'Qual o valor do vale alimentação?',
    icon: 'lucide:coins'
  },
  {
    label: 'Como funciona o banco de horas?',
    icon: 'lucide:clock'
  },
  {
    label: 'Resuma o código de vestimenta (dress code)',
    icon: 'lucide:shirt'
  },
  {
    label: 'Quais são os principais valores da Implanta?',
    icon: 'lucide:gem'
  },
  {
    label: 'Como funciona o auxílio home office?',
    icon: 'lucide:home'
  }
]
</script>

<template>
  <UDashboardPanel id="home" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col justify-center gap-4 sm:gap-6 py-8">
        <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">
          Olá! Como posso te ajudar hoje?
        </h1>

        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          class="[view-transition-name:chat-prompt]"
          variant="subtle"
          @submit="onSubmit"
        >
          <div class="flex gap-3">
            <ClientOnly>
              <UButton
                v-if="isSupported"
                :icon="isListening ? 'lucide:mic' : 'lucide:mic-off'"
                :color="isListening ? 'primary' : 'neutral'"
                variant="ghost"
                @click="toggle"
              />

              <slot name="fallback">
                <div class="size-8" />
              </slot>
            </ClientOnly>
            <UChatPromptSubmit color="neutral" />
          </div>

          <template #footer>
            <ModelSelect v-model="model" />
          </template>
        </UChatPrompt>

        <div class="flex flex-wrap gap-2">
          <Motion
            v-for="(quickChat, index) in quickChats"
            :key="quickChat.label"
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.1 + index * 0.1
            }"
          >
            <UButton
              :icon="quickChat.icon"
              :label="quickChat.label"
              size="sm"
              color="neutral"
              variant="outline"
              class="rounded-full"
              @click="createChat(quickChat.label)"
            />
          </Motion>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
