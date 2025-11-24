<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'validate-group-access'
})

const state = reactive({
  content: undefined
})

const { groups, group } = useGroup()

const toast = useToast()
const router = useRouter()
const colorMode = useColorMode()

async function onSubmit() {
  await $fetch('/api/guides', {
    method: 'POST',
    body: {
      ...state,
      groupId: group.value ? group.value.id : null
    }
  }).then(() => {
    toast.add({ title: 'Guia criado com sucesso!' })
    router.push({ name: 'dashboard-groupSlug-guide', params: {
      groupSlug: group.value ? group.value.slug : 'public'
    } })
  }).catch(() => {
    toast.add({ title: 'Erro ao criar guia', color: 'error' })
  })
}
</script>

<template>
  <UDashboardPanel id="guide-2" :ui="{ body: '', root: 'grid' }">
    <UDashboardNavbar :toggle="false" title="Adicionar Guia" icon="i-lucide-plus">
      <template #right>
        <UTooltip text="Salvar">
          <UButton icon="i-lucide-send" color="neutral" variant="ghost" :disabled="state.content === undefined"
            @click="onSubmit" />
        </UTooltip>
      </template>
    </UDashboardNavbar>

    <div class="grid">
      <MonacoEditor v-model="state.content" :options="{
        wordWrap: 'on',
        theme: colorMode.value === 'dark'
          ? 'vs-dark' : 'vs-light'
      }" lang="markdown" />
    </div>
  </UDashboardPanel>
</template>
