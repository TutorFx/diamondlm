<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { groups, group } = useGroup()

const route = useRoute()

const selectedGroup = computed(() => {
  if (route.name === 'dashboard-create-group') return {
    name: 'Create group',
    icon: 'i-lucide-circle-plus',
  }

  const sgroup = route.params.groupSlug === 'public'
    ? {
        name: 'Public',
        slug: 'public'
      }
    : group.value!

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
  return [[...groups.value!.map(group => ({
    label: group?.name,
    avatar: {
      alt: group.name
    },
    onSelect() {
      navigateTo({
        name: 'dashboard-groupSlug-guide',
        params: { groupSlug: group.slug }
      })
    }
  })),
  {
    label: 'Public',
    avatar: {
      alt: 'Public'
    },
    onSelect() {
      navigateTo({
        name: 'dashboard-groupSlug-guide',
        params: { groupSlug: 'public' }
      })
    }
  }], [{
    label: 'Create group',
    icon: 'i-lucide-circle-plus',
    to: { name: 'dashboard-create-group' }
  }, {
    label: 'Manage groups',
    icon: 'i-lucide-cog'
  }]]
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :loading="!groups"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...selectedGroup,
        label: collapsed ? undefined : selectedGroup?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />
  </UDropdownMenu>
</template>
