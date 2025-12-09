<script setup lang="ts">
definePageMeta({
  layout: 'group-manage',
  middleware: 'validate-group-access'
})
</script>

<template>
  <div class="hidden lg:flex flex-1 items-center justify-center">
    <UIcon name="i-lucide-cog" class="size-32 text-dimmed" />
  </div>
</template>
