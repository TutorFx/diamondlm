<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['not-authed'],
  colorMode: 'dark'
})
</script>

<template>
  <AuthPage style="background-image: url('/bg-login.png');" class="bg-cover bg-center">
    <UCard class="bg-default">
      <AuthLogin @submit="() => { navigateTo(`/`) }">
        <template #description>
          <div class="grid grid-flow-row place-items-center gap-2">
            <img src="/icon-atlas-branco.svg" alt="Logo" class="h-20">

            <h1 class="text-3xl font-semibold text-default">
              Bem-vindo ao <span class="text-primary">atlas</span>
            </h1>

            <p class="text-sm text-default">
              Entre com seu e-mail e senha
            </p>
          </div>
        </template>
      </AuthLogin>
    </UCard>
  </AuthPage>
</template>
