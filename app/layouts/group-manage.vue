<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const route = useRoute()

const isGuidePanelOpen = computed(() => true)

const items = computed<DropdownMenuItem[][]>(() => {
  return [
    route.params?.groupSlug
      ? [{
          label: 'Membros',
          icon: 'i-lucide-users',
          to: {
            name: 'dashboard-groupSlug-manage-member',
            params: { groupSlug: route.params.groupSlug }
          }
        }, {
          label: 'Configurações',
          icon: 'i-lucide-cog',
          to: {
            name: 'dashboard-groupSlug-manage-settings',
            params: { groupSlug: route.params.groupSlug }
          }
        }]
      : []
  ]
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')
</script>

<template>
  <NuxtLayout name="group-scope">
    <UDashboardPanel
      id="manage-1"
      :default-size="11"
      :min-size="10"
      :max-size="15"
      resizable
    >
      <UDashboardNavbar title="Gerenciar Grupo">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <div class="p-4 grid">
        <UNavigationMenu orientation="vertical" :items />
      </div>
    </UDashboardPanel>

    <slot />

    <ClientOnly>
      <USlideover v-if="isMobile" v-model:open="isGuidePanelOpen">
        <template #content>
          <slot />
        </template>
      </USlideover>
    </ClientOnly>
  </NuxtLayout>
</template>
