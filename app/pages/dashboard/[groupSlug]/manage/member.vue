<script setup lang="ts">
import { UIcon, UTooltip } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { CellContext } from '@tanstack/vue-table'
import type { GroupPermissions } from '~~/shared/types/permissions'

definePageMeta({
  layout: 'group-manage',
  middleware: 'validate-group-access'
})

const { group } = useGroup()
const headers = useRequestHeaders(['cookie'])

const query = computed(() => `/api/group/${group.value!.id}/manage/members`)
const key = computed(() => `group-members:${group.value!.id}`)

const { data: groupPermissions } = await useAsyncData(key,
  async (_nuxtApp, { signal }) => await $fetch<GroupPermissions[]>(query.value, { signal, headers })
)

type PermissionData = { name: string } & GroupPermissionMap

const allGroupPermissions = [
  ...Object.values(PERMISSIONS.GUIDE),
  ...Object.values(PERMISSIONS.GROUP)
] as const

const permissionMetadata: Record<typeof allGroupPermissions[number], { icon: string }> = {
  // Contexto: Guide (Livro/Documento)
  [PERMISSIONS.GUIDE.READ]: { icon: 'lucide:book-open' },
  [PERMISSIONS.GUIDE.CREATE]: { icon: 'lucide:book-plus' },
  [PERMISSIONS.GUIDE.UPDATE]: { icon: 'lucide:file-pen' },
  [PERMISSIONS.GUIDE.DELETE]: { icon: 'lucide:trash-2' },

  // Contexto: Group (Time/Membros)
  [PERMISSIONS.GROUP.MANAGE_MEMBERS]: { icon: 'lucide:user-cog' },
  [PERMISSIONS.GROUP.UPDATE]: { icon: 'lucide:settings-2' },
  [PERMISSIONS.GROUP.DELETE]: { icon: 'lucide:shield-alert' },
  [PERMISSIONS.GROUP.READ]: { icon: 'lucide:users' }
} as const

const rows = computed(() => {
  if (!groupPermissions.value) return []

  return groupPermissions.value.map((member) => {
    const row = {
      ...member.permissions,
      name: member.name
    }

    return row
  })
})

const columns: TableColumn<PermissionData>[] = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  ...allGroupPermissions.map(permission => ({
    accessorKey: permission,
    header: () => {
      const metadata = permissionMetadata[permission]
      return h(UTooltip, { title: permission }, h(UIcon, { name: metadata.icon }))
    },
    cell: (info: CellContext<PermissionData, unknown>) => {
      const value = info.getValue()
      return value
        ? h(UTooltip, { text: `${info.row.original.name} tem permissão ${permission}` }, h(UIcon, { name: 'twemoji:check-mark-button' }))
        : h(UTooltip, { text: `${info.row.original.name} não term permissão ${permission}` }, h(UIcon, { name: 'twemoji:prohibited' }))
    }
  }))
]
</script>

<template>
  <UDashboardPanel class="grid grid-rows-[max-content_1fr] px-0">
    <UDashboardNavbar title="Gerenciar Membros">
      <template #right>
        <UColorModeButton />
      </template>
    </UDashboardNavbar>

    <UTable v-if="groupPermissions" :columns :data="rows" />
  </UDashboardPanel>
</template>
