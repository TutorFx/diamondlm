<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

definePageMeta({
  layout: 'group-scope',
  middleware: 'validate-group-access'
})

const tabItems = [{
  label: 'Todos',
  value: 'all'
}, {
  label: 'Não Processados',
  value: 'unread'
}]
const selectedTab = ref('all')

const { group } = useGroup()

const query = computed(() => group.value ? `/api/group/${group.value.id}/guides` : '/api/guides')

const { data: guides } = await useFetch<Guide[]>(query.value, { default: () => [] })

const selectedGuide = ref<number | null>()

const isGuidePanelOpen = computed({
  get() {
    return !!selectedGuide.value
  },
  set(value: boolean) {
    if (!value) {
      selectedGuide.value = null
    }
  }
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')
</script>

<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <UDashboardPanel id="guide-1" :default-size="25" :min-size="20" :max-size="30" resizable>
    <UDashboardNavbar title="Guias">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #trailing>
        <UBadge :label="guides.length" variant="subtle" />
      </template>

      <template #right>
        <UTabs v-model="selectedTab" :items="tabItems" :content="false" size="xs" />
      </template>
    </UDashboardNavbar>
    <GuideList v-model="selectedGuide" :guides="guides" />
  </UDashboardPanel>

  <Guide v-if="selectedGuide" :guide-id="selectedGuide" @close="selectedGuide = null" />
  <div v-else class="hidden lg:flex flex-1 items-center justify-center">
    <UIcon name="i-lucide-inbox" class="size-32 text-dimmed" />
  </div>

  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isGuidePanelOpen">
      <template #content>
        <Guide v-if="selectedGuide" :guide-id="selectedGuide" @close="selectedGuide = null" />
      </template>
    </USlideover>
  </ClientOnly>
</template>
