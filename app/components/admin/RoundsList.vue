<script setup lang="ts">
import type { AdminRound } from '#shared/types/admin'

const props = defineProps<{
  slug: string
}>()

const emit = defineEmits<{
  count: [count: number]
}>()

const api = useAdminApi(() => props.slug)
const toast = useToast()

const rounds = ref<AdminRound[]>()
const participantCount = ref<number>()
const loadError = ref<string>()
const running = ref(false)
const open = ref<string[]>([])

// Polls the event too, so the participant count behind the button stays fresh.
async function refresh() {
  try {
    const [nextRounds, event] = await Promise.all([api.getRounds(), api.getEvent()])
    rounds.value = nextRounds
    participantCount.value = event.participantCount
    emit('count', event.participantCount)
    loadError.value = undefined
  } catch (error) {
    loadError.value = apiErrorMessage(error, 'Couldn\'t load rounds')
    await redirectIfLoggedOut(error)
  }
}

usePolling(refresh)

// Unknown count (still loading) doesn't block; the server rejects with 400 anyway.
const tooFew = computed(() => participantCount.value !== undefined && participantCount.value < 2)

async function runRound() {
  running.value = true
  try {
    const round = await api.runRound()
    if (round.status === 'ok') {
      toast.add({ title: `Round ${round.number} done`, color: 'success', icon: 'i-lucide-check' })
    } else {
      toast.add({ title: 'Matching failed', description: 'Run a new round.', color: 'error' })
    }
    open.value = [round.id]
    await refresh()
  } catch (error) {
    toast.add({ title: 'Couldn\'t run round', description: apiErrorMessage(error), color: 'error' })
  } finally {
    running.value = false
  }
}

const items = computed(() => (rounds.value ?? []).map(round => ({
  label: `Round ${round.number}`,
  value: round.id,
  round
})))
</script>

<template>
  <div class="space-y-4">
    <div>
      <UTooltip
        text="Need at least 2 participants"
        :disabled="!tooFew"
      >
        <span class="inline-block">
          <UButton
            label="Run matching round"
            icon="i-lucide-shuffle"
            :loading="running"
            :disabled="tooFew"
            @click="runRound"
          />
        </span>
      </UTooltip>
      <p
        v-if="running"
        class="mt-2 text-sm text-muted"
      >
        Matching everyone… this can take up to a minute.
      </p>
    </div>

    <p
      v-if="loadError && rounds"
      class="mb-2 flex items-center gap-1.5 text-sm text-warning"
    >
      <UIcon name="i-lucide-refresh-cw-off" />
      Couldn't refresh, retrying…
    </p>

    <UAlert
      v-if="loadError && !rounds"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="loadError"
    />

    <div
      v-else-if="!rounds"
      class="space-y-2"
    >
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-12 w-full"
      />
    </div>

    <div
      v-else-if="rounds.length === 0"
      class="flex flex-col items-center rounded-lg border border-dashed border-default py-16 text-center"
    >
      <UIcon
        name="i-lucide-shuffle"
        class="size-10 text-dimmed"
      />
      <p class="mt-3 text-muted">
        No rounds yet. Run the first one when people have registered.
      </p>
    </div>

    <UAccordion
      v-else
      v-model="open"
      :items="items"
      type="multiple"
    >
      <template #default="{ item }">
        <span class="flex flex-1 items-center gap-3">
          <span class="font-medium text-highlighted">{{ item.label }}</span>
          <UBadge
            variant="subtle"
            :color="item.round.status === 'ok' ? 'success' : 'error'"
            :label="item.round.status"
          />
          <span class="text-sm text-muted">{{ formatRelativeTime(item.round.createdAt) }}</span>
          <span
            v-if="item.round.status === 'ok'"
            class="ml-auto pr-2 text-sm text-muted"
          >{{ item.round.pairs.length }} {{ item.round.pairs.length === 1 ? 'group' : 'groups' }}</span>
        </span>
      </template>

      <template #body="{ item }">
        <p
          v-if="item.round.status === 'failed'"
          class="text-error"
        >
          Matching failed. Run a new round.
        </p>
        <p
          v-else-if="item.round.pairs.length === 0"
          class="text-muted"
        >
          No groups in this round.
        </p>
        <ul
          v-else
          class="space-y-3"
        >
          <li
            v-for="pair in item.round.pairs"
            :key="pair.id"
            class="rounded-lg border border-default p-4"
          >
            <div class="flex flex-wrap gap-x-6 gap-y-2">
              <div
                v-for="member in pair.members"
                :key="member.id"
                class="flex items-center gap-2"
              >
                <span class="text-lg">{{ member.emoji ?? '·' }}</span>
                <span
                  v-if="member.name === null"
                  class="text-dimmed italic"
                >(removed)</span>
                <span v-else>
                  <span class="font-medium text-highlighted">{{ member.name }}</span>
                  <span
                    v-if="member.title"
                    class="text-sm text-muted"
                  > · {{ member.title }}</span>
                </span>
              </div>
            </div>
            <p class="mt-3 text-sm text-default">
              {{ pair.reason }}
            </p>
            <ul
              v-if="pair.diff.length"
              class="mt-3 rounded-md bg-elevated px-3 py-2 font-mono text-sm"
            >
              <li
                v-for="(line, i) in pair.diff"
                :key="i"
                :class="line.sign === '+' ? 'text-success' : 'text-error'"
              >
                {{ line.sign }} {{ line.text }}
              </li>
            </ul>
            <blockquote class="mt-3 border-l-2 border-primary pl-3 text-sm text-highlighted italic">
              {{ pair.icebreaker }}
            </blockquote>
          </li>
        </ul>
      </template>
    </UAccordion>
  </div>
</template>
