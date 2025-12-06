<script setup lang="ts">
import { format, isToday, isAfter } from 'date-fns'

const props = defineProps<{
  guides: Guide[]
}>()

const guidesRefs = ref<Element[]>([])

const selectedGuide = defineModel<number | null>()

watch(selectedGuide, () => {
  if (!selectedGuide.value) {
    return
  }
  const ref = guidesRefs.value[selectedGuide.value]
  if (ref) {
    ref.scrollIntoView({ block: 'nearest' })
  }
})

defineShortcuts({
  arrowdown: () => {
    const index = props.guides.findIndex(mail => mail.id === selectedGuide.value)

    if (index === -1) {
      selectedGuide.value = props.guides[0]?.id
    } else if (index < props.guides.length - 1) {
      selectedGuide.value = props.guides[index + 1]?.id
    }
  },
  arrowup: () => {
    const index = props.guides.findIndex(mail => mail.id === selectedGuide.value)

    if (index === -1) {
      selectedGuide.value = props.guides[props.guides.length - 1]?.id
    } else if (index > 0) {
      selectedGuide.value = props.guides[index - 1]?.id
    }
  }
})
</script>

<template>
  <div class="overflow-y-auto divide-y divide-default">
    <div
      v-for="(guide, index) in guides"
      :key="index"
      :ref="el => { guidesRefs[guide.id] = el as Element }"
    >
      <div
        class="p-4 sm:px-6 text-sm cursor-pointer border-l-2 transition-colors"
        :class="[
          isAfter(new Date(guide.updatedAt), new Date(guide.createdAt)) ? 'text-highlighted' : 'text-toned',
          selectedGuide && selectedGuide === guide.id
            ? 'border-primary bg-primary/10'
            : 'border-(--ui-bg) hover:border-primary hover:bg-primary/5'
        ]"
        @click="selectedGuide = guide.id"
      >
        <div class="grid grid-cols-[1fr_max-content] items-center justify-between gap-3" :class="[isAfter(new Date(guide.updatedAt), new Date(guide.createdAt)) && 'font-semibold']">
          <div class="flex items-center gap-3 truncate">
            <span class="truncate">
              {{ guide.title }}
            </span>

            <UChip v-if="false && isAfter(new Date(guide.createdAt), new Date(guide.updatedAt))" />
          </div>

          <span>{{ isToday(new Date(guide.createdAt)) ? format(new Date(guide.createdAt), 'HH:mm') : format(new Date(guide.createdAt), 'dd MMM') }}</span>
        </div>
        <!-- <p class="truncate" :class="[isAfter(new Date(guide.updatedAt), new Date(guide.createdAt)) && 'font-semibold']">
          {{ guide.title }}
        </p> -->
        <p class="text-dimmed line-clamp-1">
          {{ guide.content }}
        </p>
      </div>
    </div>
  </div>
</template>
