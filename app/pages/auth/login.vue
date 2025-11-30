<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <AuthPage>
    <AuthLogin>
      <template #description>
        Ainda não tem conta? <ULink :to="{ name: 'auth-register' }">Registre-se</ULink>.
      </template>
    </AuthLogin>
  </AuthPage>
</template>
