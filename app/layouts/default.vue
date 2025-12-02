<script setup lang="ts">
import { LazyModalConfirm } from '#components'

const route = useRoute()
const toast = useToast()
const overlay = useOverlay()
const { loggedIn } = useUserSession()

const open = ref(false)

const deleteModal = overlay.create(LazyModalConfirm, {
  props: {
    title: 'Delete chat',
    description: 'Are you sure you want to delete this chat? This cannot be undone.'
  }
})

const { data: chats, refresh: refreshChats } = await useFetch('/api/chats', {
  key: 'chats',
  transform: data => data.map(chat => ({
    id: chat.id,
    label: chat.title || 'Untitled',
    to: `/chat/${chat.id}`,
    icon: 'i-lucide-message-circle',
    createdAt: chat.createdAt
  }))
})

onNuxtReady(async () => {
  const first10 = (chats.value || []).slice(0, 10)
  for (const chat of first10) {
    // prefetch the chat and let the browser cache it
    await $fetch(`/api/chats/${chat.id}`)
  }
})

watch(loggedIn, () => {
  refreshChats()

  open.value = false
})

const { groups } = useChats(chats)

const items = computed(() => groups.value?.flatMap((group) => {
  return [{
    label: group.label,
    type: 'label' as const
  }, ...group.items.map(item => ({
    ...item,
    slot: 'chat' as const,
    icon: undefined,
    class: item.label === 'Untitled' ? 'text-muted' : ''
  }))]
}))

async function deleteChat(id: string) {
  const instance = deleteModal.open()
  const result = await instance.result
  if (!result) {
    return
  }

  await $fetch(`/api/chats/${id}`, { method: 'DELETE' })

  toast.add({
    title: 'Chat deleted',
    description: 'Your chat has been deleted',
    icon: 'i-lucide-trash'
  })

  refreshChats()

  if (route.params.id === id) {
    navigateTo('/new-chat')
  }
}

defineShortcuts({
  c: () => {
    navigateTo('/new-chat')
  }
})

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'Utilizamos cookies próprios para aprimorar a sua experiência no nosso site.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Aceitar',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Negar',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      :min-size="12"
      collapsible
      resizable
      class="bg-elevated/50"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/new-chat" class="flex items-end gap-0.5">
          <Logo class="h-8 w-auto shrink-0" />
          <span v-if="!collapsed" class="text-xl font-bold text-highlighted">Chat</span>
        </NuxtLink>

        <div v-if="!collapsed" class="flex items-center gap-1.5 ms-auto">
          <UDashboardSearchButton collapsed />
          <UDashboardSidebarCollapse />
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-col gap-1.5">
          <UButton
            v-bind="collapsed ? { icon: 'i-lucide-plus' } : { icon: 'i-lucide-plus', label: 'Nova conversa' }"
            variant="solid"
            block
            to="/new-chat"
            @click="open = false"
          />

          <template v-if="collapsed">
            <UDashboardSearchButton collapsed />
            <UDashboardSidebarCollapse />
          </template>
        </div>

        <UNavigationMenu
          v-if="!collapsed"
          :items="items"
          :collapsed="collapsed"
          orientation="vertical"
          :ui="{ link: 'overflow-hidden' }"
        >
          <template #chat-trailing="{ item }">
            <div class="flex -mr-1.25 translate-x-full group-hover:translate-x-0 transition-transform">
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                class="text-muted hover:text-primary hover:bg-accented/50 focus-visible:bg-accented/50 p-0.5"
                tabindex="-1"
                @click.stop.prevent="deleteChat((item as any).id)"
              />
            </div>
          </template>
        </UNavigationMenu>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu v-if="loggedIn" :collapsed="collapsed" />
        <div v-else class="grid gap-2 w-full">
          <!-- Seção de Acesso Rápido -->
          <div v-if="!collapsed" class="text-xs font-semibold text-muted px-2 pt-2">
            Acesso Rápido
          </div>

          <UButton
            :label="collapsed ? '' : 'Papel Timbrado'"
            icon="i-lucide-file-text"
            color="neutral"
            variant="ghost"
            class="w-full !justify-between"
            trailing-icon="i-lucide-download"
            :ui="{ trailingIcon: 'text-yellow-500 ms-auto' }"
            to="/downloads/papel timbrado implanta.docx"
            target="_blank"
            download
          />

          <UButton
            :label="collapsed ? '' : 'Template PPT'"
            icon="i-lucide-presentation"
            color="neutral"
            variant="ghost"
            class="w-full !justify-between"
            trailing-icon="i-lucide-download"
            :ui="{ trailingIcon: 'text-yellow-500 ms-auto' }"
            to="/downloads/Exemplo .pptx"
            target="_blank"
            download
          />

          <UButton
            :label="collapsed ? '' : 'Plataforma Vibe'"
            icon="i-lucide-clock"
            color="neutral"
            variant="ghost"
            class="w-full !justify-between"
            trailing-icon="i-lucide-external-link"
            :ui="{ trailingIcon: 'text-cyan-400 ms-auto' }"
            to="https://aliare.vibe.gp/"
            target="_blank"
          />

          <UButton
            :label="collapsed ? '' : 'Plataforma Feedz'"
            icon="i-lucide-ticket"
            color="neutral"
            variant="ghost"
            class="w-full !justify-between"
            trailing-icon="i-lucide-external-link"
            :ui="{ trailingIcon: 'text-cyan-400 ms-auto' }"
            to="https://app.feedz.com.br/"
            target="_blank"
          />

          <!-- Separador -->
          <div v-if="!collapsed" class="border-t border-neutral-200 dark:border-neutral-800 my-2" />

          <!-- Botão de Login -->
          <ModalAuth>
            <UButton
              :label="collapsed ? '' : 'Entrar'"
              icon="mdi:login"
              color="neutral"
              variant="ghost"
              class="w-full"
            />
          </ModalAuth>
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch
      placeholder="Search chats..."
      :groups="[{
        id: 'links',
        items: [{
          label: 'Nova conversa',
          to: '/new-chat',
          icon: 'i-lucide-square-pen'
        }]
      }, ...groups]"
    />

    <slot />
  </UDashboardGroup>
</template>
