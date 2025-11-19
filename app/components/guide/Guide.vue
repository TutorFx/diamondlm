<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps<{
  guideId: number
}>()

const emits = defineEmits(['close'])

const dropdownItems = [[{
  label: 'Mark as unread',
  icon: 'i-lucide-check-circle'
}, {
  label: 'Mark as important',
  icon: 'i-lucide-triangle-alert'
}], [{
  label: 'Star thread',
  icon: 'i-lucide-star'
}, {
  label: 'Mute thread',
  icon: 'i-lucide-circle-pause'
}]]

const toast = useToast()

const update = ref('')
const colorMode = useColorMode()

const guideId = computed(() => props.guideId)

const { data: guide, refresh } = await useAsyncData<Guide>(() => $fetch(`/api/guides/${guideId.value}`))

watch(() => props.guideId, () => {
  refresh()
})

watch(guide, (newGuide) => {
  if (newGuide) {
    update.value = newGuide.content
  }
}, { deep: true, immediate: true })

const isEdited = computed(() => {
  return update.value !== (guide.value?.content || '')
})

function updateGuide() {
  $fetch(`/api/guides/${guideId.value}`, {
    method: 'POST',
    body: {
      ...guide.value,
      content: update.value
    }
  }).then(() => {
    toast.add({
      description: 'Guia atualizado com sucesso',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
    refresh()
  }).catch(() => {
    toast.add({
      description: 'Falha ao atualizar o guia',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  })
}
</script>

<template>
  <UDashboardPanel id="guide-2" :ui="{ body: '', root: 'grid' }">
    <UDashboardNavbar v-if="guide" :title="guide.title" :toggle="false">
      <template #leading>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="-ms-1.5"
          @click="emits('close')"
        />
      </template>

      <template #right>
        <UTooltip text="Salvar">
          <UButton
            icon="i-lucide-save"
            color="neutral"
            variant="ghost"
            :disabled="!isEdited"
            @click="updateGuide"
          />
        </UTooltip>

        <UTooltip text="Reply">
          <UButton icon="i-lucide-reply" color="neutral" variant="ghost" />
        </UTooltip>

        <UDropdownMenu :items="dropdownItems">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="ghost"
          />
        </UDropdownMenu>
      </template>
    </UDashboardNavbar>

    <div class="grid">
      <MonacoEditor
        v-model="update"
        :options="{
          wordWrap: 'on',
          theme: colorMode.value === 'dark'
            ? 'vs-dark' : 'vs-light'
        }"
        lang="markdown"
      />
    </div>
  </UDashboardPanel>
</template>
