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
      color="#00d5be"
      :staticity="10"
      refresh
    />
  </div>
</template>

<script setup lang="ts">
const root = ref<HTMLElement | null>(null)

onMounted(() => {
  root.value = document.documentElement
})
</script>
