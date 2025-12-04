<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['not-authed'],
  colorMode: 'dark'
})
</script>

<template>
  <AuthPage>
    <AuthRegister @submit="() => { navigateTo(`/`) }">
      <template #description>
        Já tem conta? <ULink :to="{ name: 'auth-login' }">Faça login</ULink>
      </template>
    </AuthRegister>
  </AuthPage>
</template>
