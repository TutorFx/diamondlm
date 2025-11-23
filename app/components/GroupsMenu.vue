<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { groups, group } = useGroup()

const selectedGroup = computed(() => {
  const sgroup = groups.value!.find(g => g.slug === group.value.slug)

  if (!sgroup) return createError({
    statusCode: 404,
    statusMessage: 'Group not found'
  })

  return {
    ...sgroup,
    avatar: {
      alt: sgroup.name
    }
  }
})

const items = computed<DropdownMenuItem[][]>(() => {
  return [groups.value!.map(group => ({
    label: group.name,
    avatar: {
      alt: group.name
    },
    onSelect() {
      navigateTo({
        name: 'dashboard-groupSlug-guide',
        params: { groupSlug: group.slug }
      })
    }
  })), [{
    label: 'Create group',
    icon: 'i-lucide-circle-plus'
  }, {
    label: 'Manage groups',
    icon: 'i-lucide-cog'
  }]]
})
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton v-bind="{
      ...selectedGroup,
      label: collapsed ? undefined : selectedGroup?.name,
      trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
    }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']" :ui="{
        trailingIcon: 'text-dimmed'
      }" />
  </UDropdownMenu>
</template>
