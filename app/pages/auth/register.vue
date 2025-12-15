<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['not-authed'],
  colorMode: 'dark'
})

useHead({
  meta: [
    {
      name: 'theme-color',
      content: '#000'
    }
  ]
})
</script>

<template>
  <AuthPage>
    <UCard class="bg-black/50 ring-0 backdrop-blur-xl">
      <AuthRegister @submit="() => { navigateTo(`/`) }">
        <template #description>
          Já tem conta? <ULink :to="{ name: 'auth-login' }">Faça login</ULink>
        </template>
      </AuthRegister>
    </UCard>
  </AuthPage>
</template>
