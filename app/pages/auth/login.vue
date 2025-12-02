<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  colorMode: 'light'
})
</script>

<template>
  <AuthPage style="background-image: url('/bg-login.png');" class="bg-cover">
    <AuthLogin>
      <template #description>
        <div class="grid grid-flow-row place-items-center gap-2">
          <img src="/icon-atlas-branco.svg" alt="Logo" class="h-20">

          <h1 class="text-3xl font-semibold text-white">
            Bem-vindo ao <span class="text-teal-500">atlas</span>
          </h1>

          <p class="text-sm text-white/60">
            Entre com seu e-mail e senha
          </p>
        </div>
      </template>
    </AuthLogin>
  </AuthPage>
</template>
