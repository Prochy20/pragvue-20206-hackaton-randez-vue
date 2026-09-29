<script setup lang="ts">
import type { OrganizerEvent } from '#shared/types/admin'

const { data: events, status, error, refresh } = useFetch<OrganizerEvent[]>('/api/events', { default: () => [] })

// Session gone (e.g. logged out in another tab): go to login instead of showing an error.
watch(error, value => redirectIfLoggedOut(value), { immediate: true })
</script>

<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-highlighted">
      Your events
    </h2>

    <div
      v-if="status === 'pending'"
      class="space-y-3"
    >
      <USkeleton class="h-16 w-full" />
      <USkeleton class="h-16 w-full" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="apiErrorMessage(error, 'Couldn\'t load your events')"
      :actions="[{ label: 'Try again', color: 'error', variant: 'outline', onClick: () => refresh() }]"
    />

    <p
      v-else-if="events.length === 0"
      class="rounded-lg border border-dashed border-default p-6 text-center text-muted"
    >
      No events yet. Create your first one to get started.
    </p>

    <div
      v-else
      class="space-y-3"
    >
      <UCard
        v-for="item in events"
        :key="item.slug"
        :ui="{ body: 'p-3 sm:p-4' }"
      >
        <div class="flex items-center gap-4">
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-highlighted">
              {{ item.name }}
            </p>
            <p class="text-sm text-muted">
              {{ item.participantCount }} {{ item.participantCount === 1 ? 'participant' : 'participants' }}
              · created {{ formatRelativeTime(item.createdAt) }}
            </p>
          </div>
          <UButton
            :to="`/e/${item.slug}/admin`"
            label="Open admin"
            trailing-icon="i-lucide-arrow-right"
            color="neutral"
            variant="outline"
          />
        </div>
      </UCard>
    </div>
  </section>
</template>
