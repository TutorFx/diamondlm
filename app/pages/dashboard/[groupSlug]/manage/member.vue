<script setup lang="ts">
import { UIcon, UTooltip, UCheckbox, UButton, USlideover, UForm, UInput } from '#components'
import { z } from 'zod'
import type { TableColumn } from '@nuxt/ui'
import type { CellContext } from '@tanstack/vue-table'
import type { GroupPermissions, GroupPermissionMap } from '~~/shared/types/permissions'

definePageMeta({
  layout: 'group-scope',
  middleware: 'validate-group-access'
})

const { group } = useGroup()
const headers = useRequestHeaders(['cookie'])
const toast = useToast()

const query = computed(() => `/api/group/${group.value!.id}/manage/members`)
const key = computed(() => `group-members:${group.value!.id}`)

const { data: groupPermissions, refresh } = await useAsyncData(key,
  async (_nuxtApp, { signal }) => await $fetch<GroupPermissions[]>(query.value, { signal, headers })
)

type PermissionData = { name: string, id: string } & GroupPermissionMap

const localPermissions = ref<GroupPermissions[]>([])

// Sync local state when data is fetched
watch(groupPermissions, (newData) => {
  if (newData) {
    localPermissions.value = JSON.parse(JSON.stringify(newData))
  }
}, { immediate: true, deep: true })

const isSaving = ref(false)

const hasChanges = computed(() => {
  return JSON.stringify(localPermissions.value) !== JSON.stringify(groupPermissions.value)
})

async function save() {
  if (!localPermissions.value) return

  isSaving.value = true
  try {
    const updates = localPermissions.value.map((member) => {
      const original = groupPermissions.value?.find(p => p.id === member.id)
      if (JSON.stringify(original?.permissions) === JSON.stringify(member.permissions)) {
        return null
      }

      return $fetch(`/api/group/${group.value!.id}/manage/member/${member.id}`, {
        method: 'POST',
        headers,
        body: { permissions: member.permissions }
      })
    }).filter(Boolean)

    if (updates.length > 0) {
      await Promise.all(updates)
      await refresh()
      toast.add({ title: 'Permissões atualizadas com sucesso', color: 'success' })
    } else {
      toast.add({ title: 'Nenhuma alteração para salvar', color: 'info' })
    }
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Erro ao salvar permissões', color: 'error' })
  } finally {
    isSaving.value = false
  }
}

function reset() {
  if (groupPermissions.value) {
    localPermissions.value = JSON.parse(JSON.stringify(groupPermissions.value))
  }
}

const allGroupPermissions = [
  ...Object.values(PERMISSIONS.GUIDE),
  ...Object.values(PERMISSIONS.GROUP)
] as const

const permissionMetadata: Record<typeof allGroupPermissions[number], { icon: string }> = {
  // Contexto: Guide (Livro/Documento)
  [PERMISSIONS.GUIDE.READ]: { icon: 'lucide:inbox' },
  [PERMISSIONS.GUIDE.CREATE]: { icon: 'lucide:file-up' },
  [PERMISSIONS.GUIDE.UPDATE]: { icon: 'lucide:file-pen' },
  [PERMISSIONS.GUIDE.DELETE]: { icon: 'lucide:file-x-corner' },

  // Contexto: Group (Time/Membros)
  [PERMISSIONS.GROUP.MANAGE_MEMBERS]: { icon: 'lucide:user-cog' },
  [PERMISSIONS.GROUP.UPDATE]: { icon: 'lucide:settings-2' },
  [PERMISSIONS.GROUP.DELETE]: { icon: 'lucide:eye' },
  [PERMISSIONS.GROUP.READ]: { icon: 'lucide:users' }
} as const

const rows = computed<PermissionData[]>(() => {
  return localPermissions.value.map((member) => {
    const row = {
      ...member.permissions,
      name: member.name,
      id: member.id
    }
    return row
  })
})

const columns: TableColumn<PermissionData>[] = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  ...allGroupPermissions.map(permission => ({
    accessorKey: permission,
    header: () => {
      const metadata = permissionMetadata[permission]
      return h(UTooltip, { title: permission }, h(UIcon, { name: metadata.icon, size: 18 }))
    },
    cell: (info: CellContext<PermissionData, unknown>) => {
      return h(UCheckbox, {
        'size': 'xl',
        'variant': 'list',
        'modelValue': info.row.original[permission] as boolean,
        'onUpdate:modelValue': (value: unknown) => {
          const memberId = info.row.original.id
          const member = localPermissions.value.find(m => m.id === memberId)
          if (member && typeof value === 'boolean') {
            member.permissions[permission] = value
          }
        }
      })
    }
  }))
]

const isAddMemberOpen = ref(false)
const isAddingMember = ref(false)
const addMemberState = reactive({
  email: ''
})

const addMemberSchema = z.object({
  email: z.email('Email inválido')
})

async function addMember() {
  isAddingMember.value = true
  try {
    await $fetch(`/api/group/${group.value!.id}/manage/members`, {
      method: 'POST',
      headers,
      body: { email: addMemberState.email }
    })

    toast.add({ title: 'Membro adicionado com sucesso', color: 'success' })
    isAddMemberOpen.value = false
    addMemberState.email = ''
    await refresh()
  } catch (err: unknown) {
    console.error(err)
    const error = err as { data?: { message?: string } }
    toast.add({
      title: 'Erro ao adicionar membro',
      description: error.data?.message || 'Ocorreu um erro',
      color: 'error'
    })
  } finally {
    isAddingMember.value = false
  }
}
</script>

<template>
  <UDashboardPanel class="grid grid-rows-[max-content_1fr] px-0">
    <UDashboardNavbar title="Gerenciar Membros">
      <template #left>
        <USlideover title="Adicionar Membro">
          <UButton
            icon="lucide:user-plus"
            label="Adicionar Membro"
            variant="ghost"
            color="neutral"
          />
          <template #content="{ close }">
            <div class="p-4 flex flex-col gap-4 h-full">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">
                  Adicionar Membro
                </h3>
                <UButton
                  icon="lucide:x"
                  color="neutral"
                  variant="ghost"
                  @click="close()"
                />
              </div>

              <UForm
                :schema="addMemberSchema"
                :state="addMemberState"
                class="flex flex-col gap-4"
                @submit="addMember"
              >
                <UFormGroup label="Email do usuário" name="email">
                  <UInput v-model="addMemberState.email" placeholder="exemplo@email.com" autofocus />
                </UFormGroup>

                <div class="flex justify-end gap-2 mt-4">
                  <UButton
                    label="Cancelar"
                    color="neutral"
                    variant="ghost"
                    @click="isAddMemberOpen = false"
                  />
                  <UButton
                    type="submit"
                    label="Adicionar"
                    color="primary"
                    :loading="isAddingMember"
                  />
                </div>
              </UForm>
            </div>
          </template>
        </USlideover>
      </template>
      <template #right>
        <UButton
          v-if="hasChanges"
          color="neutral"
          variant="ghost"
          label="Resetar"
          :disabled="isSaving"
          @click="reset"
        />
        <UButton
          v-if="hasChanges"
          color="primary"
          :loading="isSaving"
          label="Salvar Alterações"
          @click="save"
        />
        <UColorModeButton />
      </template>
    </UDashboardNavbar>

    <UTable :columns :data="rows" />
  </UDashboardPanel>
</template>
