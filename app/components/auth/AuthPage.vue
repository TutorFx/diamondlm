<template>
  <div
    class="relative grid items-center overflow-hidden bg-black"
  >
    <div class="relative mx-auto w-full sm:w-sm z-10 px-4">
      <slot />
    </div>
    <!-- <BackgroundParticles
      class="absolute inset-0"
      :quantity="100"
      :ease="100"
      color="#00d5be"
      :staticity="10"
      refresh
    /> -->
    <background-neural
      class="absolute inset-0"
      :hue="140"
      :chroma="0.6"
      :saturation="0.7"
    />
  </div>
</template>

<script setup lang="ts">
import type { BackgroundNeural } from '#components'

const root = ref<HTMLElement | null>(null)

onMounted(() => {
  root.value = document.documentElement
})
</script>
