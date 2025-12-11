<script setup lang="ts">
const props = defineProps<{
  sources: DeltaType[]
}>()

const route = useRoute()
const router = useRouter()

const currentSource = computed(() => typeof route.query.source === 'string' ? Number(route.query.source) : null)
const getSourceData = computed<DeltaType<'search-delta'> | null>(() => (props.sources.find(item => item.type === 'search-delta' && item.id === currentSource.value) as DeltaType<'search-delta'>) ?? null)

const sourceBoolean = computed<boolean>({
  get: () => {
    return typeof currentSource.value === 'number'
  },
  set: (a) => {
    if (!a) {
      router.push({ query: { source: undefined } })
    }
  }
})
</script>

<template>
  <div class="px-3 py-4 grid gap-1">
    <div class="flex flex-wrap items-center gap-1">
      <span>
        Fontes
      </span>
      <UIcon name="lucide:badge-question-mark" />
    </div>
    <div class="grid">
      <div
        v-for="(source, index) in sources.filter(item => item.type === 'search-delta')"
        :key="index"
        class="grid grid-flow-col justify-start gap-1"
      >
        <span class="text-dimmed">
          {{ index }}.
        </span>
        <ULink :active="false" :to="{ query: { source: source.id } }">
          {{ source.source }}[#{{ source.id }}]
        </ULink>
      </div>
    </div>
  </div>
  <USlideover
    v-model:open="sourceBoolean"
    :title="getSourceData?.source"
    description="aaa"
  >
    <template #content>
      <div>
        <div class="flex p-4 items-center gap-6">
          <div class="grow truncate">
            {{ getSourceData?.source }}
          </div>
          <UButton
            icon="lucide:x"
            variant="soft"
            color="neutral"
            @click="sourceBoolean = false"
          />
        </div>
        <USeparator />
      </div>
      <div class="p-6 overflow-y-auto">
        <MDCCached
          v-if="getSourceData"
          :value="getSourceData.text"
          :cache-key="getSourceData.id.toString()"
          :parser-options="{ highlight: false }"
          class="*:first:mt-0 *:last:mb-0"
        />
      </div>
    </template>
  </USlideover>
</template>
