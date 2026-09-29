<script setup lang="ts">
import type { AdminRound } from '#shared/types/admin'

const props = defineProps<{
  slug: string
  adminKey: string
}>()

const api = useAdminApi(() => props.slug, () => props.adminKey)

const rounds = ref<AdminRound[]>()
const loadError = ref<string>()

async function refresh() {
  try {
    rounds.value = await api.getRounds()
    loadError.value = undefined
  } catch (error) {
    loadError.value = apiErrorMessage(error, 'Couldn\'t load rounds')
  }
}

usePolling(refresh)

const items = computed(() => (rounds.value ?? []).map(round => ({
  label: `Round ${round.number}`,
  value: round.id,
  round
})))
</script>

<template>
  <div class="space-y-4">
    <UTooltip text="Coming soon">
      <span class="inline-block">
        <UButton
          label="Run matching round"
          icon="i-lucide-shuffle"
          disabled
        />
      </span>
    </UTooltip>

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
        No matching rounds yet.
      </p>
    </div>

    <UAccordion
      v-else
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
          <span class="ml-auto pr-2 text-sm text-muted">{{ item.round.pairs.length }} {{ item.round.pairs.length === 1 ? 'pair' : 'pairs' }}</span>
        </span>
      </template>

      <template #body="{ item }">
        <p
          v-if="item.round.pairs.length === 0"
          class="text-muted"
        >
          No pairs in this round.
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
            <blockquote class="mt-2 border-l-2 border-primary pl-3 text-sm text-highlighted italic">
              {{ pair.icebreaker }}
            </blockquote>
          </li>
        </ul>
      </template>
    </UAccordion>
  </div>
</template>
