<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <AuthPage>
    <AuthRegister>
      <template #description>
        Já tem conta? <ULink :to="{ name: 'auth-login' }">Faça login</ULink>
      </template>
    </AuthRegister>
  </AuthPage>
</template>
