<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { AdminParticipant } from '#shared/types/admin'

const props = defineProps<{
  slug: string
}>()

const emit = defineEmits<{
  count: [count: number]
}>()

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

const toast = useToast()
const api = useAdminApi(() => props.slug)

const participants = ref<AdminParticipant[]>()
const loadError = ref<string>()
const expanded = ref({})

async function refresh() {
  try {
    participants.value = await api.getParticipants()
    loadError.value = undefined
    emit('count', participants.value.length)
  } catch (error) {
    loadError.value = apiErrorMessage(error, 'Couldn\'t load participants')
    await redirectIfLoggedOut(error)
  }
}

usePolling(refresh)

const toRemove = ref<AdminParticipant>()
const removing = ref(false)
const modalOpen = computed({
  get: () => !!toRemove.value,
  set: (open) => {
    if (!open) {
      toRemove.value = undefined
    }
  }
})

async function confirmRemove() {
  const participant = toRemove.value
  if (!participant) {
    return
  }
  removing.value = true
  try {
    await api.deleteParticipant(participant.id)
    toast.add({ title: `${participant.name} removed`, color: 'success', icon: 'i-lucide-check' })
    toRemove.value = undefined
    await refresh()
  } catch (error) {
    toast.add({ title: 'Couldn\'t remove participant', description: apiErrorMessage(error), color: 'error' })
    // Already gone (removed in another tab) or not: either way show the real list.
    await refresh()
  } finally {
    removing.value = false
  }
}

const columns: TableColumn<AdminParticipant>[] = [{
  id: 'expand',
  cell: ({ row }) => h(UButton, {
    'color': 'neutral',
    'variant': 'ghost',
    'icon': 'i-lucide-chevron-down',
    'square': true,
    'size': 'sm',
    'aria-label': 'Show details',
    'ui': { leadingIcon: ['transition-transform', row.getIsExpanded() ? 'duration-200 rotate-180' : ''] },
    'onClick': () => row.toggleExpanded()
  })
}, {
  accessorKey: 'emoji',
  header: '',
  cell: ({ row }) => h('span', { class: 'text-xl' }, row.original.emoji ?? '·')
}, {
  accessorKey: 'name',
  header: 'Name',
  cell: ({ row }) => h('div', [
    h('p', { class: 'font-medium text-highlighted' }, row.original.name),
    h('p', { class: 'text-xs text-muted' }, [row.original.role, row.original.company].filter(Boolean).join(' · '))
  ])
}, {
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => row.original.title ?? h('span', { class: 'italic text-dimmed' }, '—')
}, {
  accessorKey: 'aiStatus',
  header: 'AI',
  cell: ({ row }) => h(UBadge, {
    variant: 'subtle',
    color: row.original.aiStatus === 'ok' ? 'success' : 'error'
  }, () => row.original.aiStatus)
}, {
  accessorKey: 'createdAt',
  header: 'Registered',
  cell: ({ row }) => h('span', { title: new Date(row.original.createdAt).toLocaleString('en-GB') }, formatRelativeTime(row.original.createdAt))
}, {
  id: 'actions',
  meta: { class: { td: 'text-right' } },
  cell: ({ row }) => h(UButton, {
    'color': 'error',
    'variant': 'ghost',
    'icon': 'i-lucide-trash-2',
    'size': 'sm',
    'aria-label': `Remove ${row.original.name}`,
    'onClick': () => {
      toRemove.value = row.original
    }
  })
}]
</script>

<template>
  <div>
    <p
      v-if="loadError && participants"
      class="mb-2 flex items-center gap-1.5 text-sm text-warning"
    >
      <UIcon name="i-lucide-refresh-cw-off" />
      Couldn't refresh, retrying…
    </p>

    <UAlert
      v-if="loadError && !participants"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="loadError"
    />

    <div
      v-else-if="!participants"
      class="space-y-2"
    >
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-12 w-full"
      />
    </div>

    <div
      v-else-if="participants.length === 0"
      class="flex flex-col items-center rounded-lg border border-dashed border-default py-16 text-center"
    >
      <UIcon
        name="i-lucide-user-plus"
        class="size-10 text-dimmed"
      />
      <p class="mt-3 text-muted">
        No one has registered yet. Share the registration link.
      </p>
    </div>

    <UTable
      v-else
      v-model:expanded="expanded"
      :data="participants"
      :columns="columns"
      :get-row-id="(row: AdminParticipant) => row.id"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
    >
      <template #expanded="{ row }">
        <div class="space-y-3 px-2 py-1 whitespace-normal">
          <p
            v-if="row.original.tagline"
            class="text-default italic"
          >
            “{{ row.original.tagline }}”
          </p>
          <dl class="grid gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <template
              v-for="answer in row.original.answers"
              :key="answer.questionId"
            >
              <dt class="text-sm text-muted">
                {{ answer.question }}
              </dt>
              <dd class="text-sm text-highlighted">
                {{ answer.answer || '—' }}
              </dd>
            </template>
          </dl>
        </div>
      </template>
    </UTable>

    <UModal
      v-model:open="modalOpen"
      :title="`Remove ${toRemove?.name ?? ''}?`"
      description="Their past matches stay in round history."
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="modalOpen = false"
          />
          <UButton
            label="Remove"
            color="error"
            icon="i-lucide-trash-2"
            :loading="removing"
            @click="confirmRemove"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
