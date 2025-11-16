<script setup lang="ts">
const open = ref(false)

defineShortcuts({
  o: () => open.value = !open.value
})

const items = [
  {
    label: 'Login',
    slot: 'login'
  },
  {
    label: 'Registrar',
    slot: 'register'
  }
]
</script>

<template>
  <UModal v-model:open="open">
    <slot />

    <template #content>
      <UCard>
        <UTabs :items="items">
          <template #login>
            <AuthLogin class="pt-6" />
          </template>

          <template #register>
            <AuthRegister class="pt-6" />
          </template>
        </UTabs>
      </UCard>
    </template>
  </UModal>
</template>
