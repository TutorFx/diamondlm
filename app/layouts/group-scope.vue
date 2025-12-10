<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const open = ref(false)

const { group } = useGroup()

const links = computed(() => [[
  {
    label: 'Chat',
    icon: 'lucide:message-square',
    to: '/new-chat',
    onSelect: () => {
      open.value = false
    }
  }, ...(route.params.groupSlug
    ? [{
        label: 'Guias',
        icon: 'lucide:inbox',
        to: {
          name: 'dashboard-groupSlug-guide',
          params: { groupSlug: route.params.groupSlug }
        },
        children: [{
          label: 'Novo Guia',
          icon: 'lucide:plus',
          to: {
            name: 'dashboard-groupSlug-guide-add',
            params: { groupSlug: route.params.groupSlug }
          },
          onSelect: () => {
            open.value = false
          }
        }]
      }, ...(group.value?.permissions.includes(PERMISSIONS.GROUP.MANAGE_MEMBERS)
        ? [{
            icon: 'i-lucide-cog',
            label: 'Gerenciar',
            children: [{
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
          }]
        : [])
      ]
    : [])
], []] satisfies NavigationMenuItem[][])

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value.flat()
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <GroupsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>
