<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

const { audioEnabled, toggleAudio } = useAudioSettings()
const { isProcessing } = useAudioPlayer()

const stringA = 'lucide:volume-2'
const stringB = 'lucide:volume-1'

const isFirstStr = ref(true)

const actualText = computed(() => {
  return isFirstStr.value ? stringA : stringB
})

let intervaloId: NodeJS.Timeout | null = null

onMounted(() => {
  intervaloId = setInterval(() => {
    isFirstStr.value = !isFirstStr.value
  }, 500)
})

onUnmounted(() => {
  if (intervaloId) {
    clearInterval(intervaloId)
  }
})
</script>

<template>
  <ClientOnly>
    <UTooltip :text="audioEnabled ? 'Mute audio' : 'Unmute audio'">
      <UButton
        :icon="audioEnabled
          ? isProcessing
            ? actualText
            : stringA
          : 'lucide:volume-x'"
        aria-label="Toggle audio"
        color="neutral"
        variant="ghost"
        v-bind="$attrs"
        @click="toggleAudio"
      />
    </UTooltip>

    <template #fallback>
      <slot name="fallback">
        <div class="size-8" />
      </slot>
    </template>
  </ClientOnly>
</template>
