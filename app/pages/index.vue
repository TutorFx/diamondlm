<script setup lang="ts">
definePageMeta({
  middleware: ['authed']
})

async function createChat(prompt: string) {
  const chat = await $fetch('/api/chats', {
    method: 'POST',
    body: { input: prompt }
  })

  refreshNuxtData('chats')
  navigateTo(`/chat/${chat?.id}`)
}

defineShortcuts({
  enter: {
    usingInput: true,
    handler: () => {
      navigateTo(`/new-chat`)
    }
  }
})

const features = [
  { label: 'Respostas instantâneas', icon: 'lucide:zap' },
  { label: 'Disponível 24/7', icon: 'lucide:clock' },
  { label: 'Seguro e confidencial', icon: 'lucide:shield-check' },
  { label: 'Sempre atualizado', icon: 'lucide:trending-up' }
]

const topicCards = [
  {
    title: 'Onboarding',
    description: 'Comece sua jornada na empresa',
    icon: 'lucide:book-open',
    prompt: 'Quero iniciar meu onboarding'
  },
  {
    title: 'Tickets',
    description: 'Abra chamados e acompanhe solicitações',
    icon: 'lucide:ticket',
    prompt: 'Quero abrir um chamado'
  },
  {
    title: 'Segurança',
    description: 'Políticas e procedimentos de segurança',
    icon: 'lucide:shield',
    prompt: 'Quais são as políticas de segurança?'
  },
  {
    title: 'RH Benefícios',
    description: 'Consulte seus benefícios e vantagens',
    icon: 'lucide:gift',
    prompt: 'Quais são os meus benefícios?'
  }
]
</script>

<template>
  <UDashboardPanel id="home" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <UContainer class="grid items-center justify-center gap-3 md:gap-8 py-12 max-w-5xl overflow-x-hidden">
        <!-- Hero Section -->
        <div class="text-center space-y-4">
          <Motion
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.1
            }"
          >
            <div class="flex items-center justify-center gap-2 mb-2 md:mb-6">
              <img src="/icon-atlas.svg" class="h-28 block dark:hidden">
              <img src="/icon-atlas-branco.svg" class="h-28 hidden dark:block">
            </div>
          </Motion>

          <Motion
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.2
            }"
          >
            <h2 class="text-lg md:text-xl text-accent max-sm:hidden">
              Bem-vindo ao Atlas
            </h2>
          </Motion>

          <Motion
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.3
            }"
          >
            <p class="text-sm md:text-lg text-muted">
              Seu assistente virtual inteligente para tudo sobre a
              empresa
            </p>
          </Motion>
        </div>

        <!-- Features Row -->
        <div class="flex flex-wrap justify-center gap-4 w-full max-sm:hidden">
          <Motion
            v-for="(feature, index) in features"
            :key="feature.label"

            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.4 + index * 0.1
            }"
          >
            <UBadge
              class="bg-elevated text-default"

              variant="solid"
              color="neutral"
              size="xl"
            >
              <UIcon :name="feature.icon" class="w-5 h-5 text-warning" />
              <span>{{ feature.label }}</span>
            </UBadge>
          </Motion>
        </div>

        <div class="w-full text-center mt-4">
          <Motion
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.5
            }"
          >
            <p class="text-accent text-sm font-medium">
              Como posso ajudar?
            </p>
          </Motion>
        </div>

        <!-- Topic Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Motion
            v-for="(card, index) in topicCards"
            :key="card.title"

            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.6 + index * 0.1
            }"
          >
            <UCard
              class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all group hover:scale-105 hover:bg-elevated/50"
              @click="createChat(card.prompt)"
            >
              <div class="grid grid-flow-col justify-start items-start gap-4 group-hover:scale-102 transition-all duration-300 transform-gpu">
                <div class="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg grid items-center">
                  <UIcon :name="card.icon" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 class="font-semibold text-lg text-highlighted">
                    {{ card.title }}
                  </h3>
                  <p class="text-sm mt-1 text-muted group-hover:text-highlighted">
                    {{ card.description }}
                  </p>
                </div>
              </div>
            </UCard>
          </Motion>
        </div>

        <!-- CTA Button -->
        <div class="mt-4 w-full flex justify-center">
          <Motion
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.7
            }"
          >
            <UButton
              to="/new-chat"
              size="xl"
              color="primary"
              variant="solid"
              class="px-8 py-3 rounded-lg font-medium"
            >
              <UIcon name="lucide:message-square" class="mr-2" />
              Iniciar Conversa
            </UButton>
          </Motion>
        </div>

        <!-- Footer -->
        <div class="mt-auto pt-8 text-center space-y-2">
          <div class="text-sm max-md:hidden text-muted flex gap-2 justify-center items-center flex-wrap">
            <Motion
              :initial="{
                scale: 1.1,
                opacity: 0,
                filter: 'blur(20px)'
              }"
              :animate="{
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)'
              }"
              :transition="{
                duration: 0.6,
                delay: 0.8
              }"
            >
              <span>
                Ou aperte
              </span>
            </Motion>
            <Motion
              :initial="{
                scale: 1.1,
                opacity: 0,
                filter: 'blur(20px)'
              }"
              :animate="{
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)'
              }"
              :transition="{
                duration: 0.6,
                delay: 0.9
              }"
            >
              <UKbd size="sm">
                Enter
              </UKbd>
            </Motion>
            <Motion
              :initial="{
                scale: 1.1,
                opacity: 0,
                filter: 'blur(20px)'
              }"
              :animate="{
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)'
              }"
              :transition="{
                duration: 0.6,
                delay: 1
              }"
            >
              <span>
                para começar
              </span>
            </Motion>
          </div>
          <Motion
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 1.3
            }"
          >
            <div class="flex max-md:flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4">
              <UIcon name="lucide:lock" class="w-3 h-3 text-warning" />
              <span>Suas conversas são criptografadas e protegidas</span>
              <span class="max-sm:hidden">•</span>
              <span>Conformidade LGPD</span>
              <span class="max-sm:hidden">•</span>
              <span>Uptime 99%</span>
            </div>
          </Motion>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
