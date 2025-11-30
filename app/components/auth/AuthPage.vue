<template>
  <div
    class="relative grid items-center"
  >
    <div class="relative mx-auto w-full sm:w-sm z-10 px-4">
      <slot />
    </div>
    <BackgroundParticles
      class="absolute inset-0"
      :quantity="100"
      :ease="100"
      :color="color"
      :staticity="10"
      refresh
    />
  </div>
</template>

<script setup lang="ts">
import { formatHex, parse } from 'culori'

const root = ref<HTMLElement | null>(null)
const color = computed(() => root.value ? formatHex(parse(getComputedStyle(root.value).getPropertyValue('--ui-primary'))) : '#fff')

onMounted(() => {
  root.value = document.documentElement
})
</script>
