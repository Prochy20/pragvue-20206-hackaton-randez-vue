<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { AdminEvent } from '#shared/types/admin'
import type { Questionnaire } from '#shared/utils/questionnaire'

type Tab = 'questionnaire' | 'participants' | 'rounds'
const TABS: Tab[] = ['questionnaire', 'participants', 'rounds']

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()

const slug = computed(() => String(route.params.slug))
const state = ref<'loading' | 'not-found' | 'error' | 'ready'>('loading')
const event = ref<AdminEvent>()

const api = useAdminApi(slug)

useSeoMeta({ title: () => event.value ? `${event.value.name} · Admin · Rendez-Vue` : 'Admin · Rendez-Vue' })

const tab = computed<Tab>({
  get: () => TABS.includes(route.query.tab as Tab) ? route.query.tab as Tab : 'questionnaire',
  set: value => router.replace({ query: { ...route.query, tab: value } })
})

const tabItems = computed<TabsItem[]>(() => [
  { label: 'Questionnaire', icon: 'i-lucide-list-checks', value: 'questionnaire' },
  { label: 'Participants', icon: 'i-lucide-users', value: 'participants', badge: event.value?.participantCount || undefined },
  { label: 'Rounds', icon: 'i-lucide-shuffle', value: 'rounds' }
])

async function load() {
  try {
    event.value = await api.getEvent()
    state.value = 'ready'
  } catch (error) {
    const status = apiErrorStatus(error)
    if (status === 401) {
      await navigateTo('/login')
      return
    }
    state.value = status === 404 ? 'not-found' : 'error'
  }
}

onMounted(load)

function onSaved(questionnaire: Questionnaire) {
  if (event.value) {
    event.value.questionnaire = questionnaire
  }
}

function onParticipantCount(count: number) {
  if (event.value) {
    event.value.participantCount = count
  }
}
</script>

<template>
  <UContainer class="py-8 sm:py-12">
    <div
      v-if="state === 'loading'"
      class="space-y-6"
    >
      <USkeleton class="h-10 w-72" />
      <USkeleton class="h-16 w-full" />
      <div class="grid gap-3 sm:grid-cols-3">
        <USkeleton class="h-20" />
        <USkeleton class="h-20" />
        <USkeleton class="h-20" />
      </div>
      <USkeleton class="h-64 w-full" />
    </div>

    <div
      v-else-if="state !== 'ready' || !event"
      class="mx-auto flex max-w-md flex-col items-center py-16 text-center"
    >
      <UIcon
        :name="state === 'not-found' ? 'i-lucide-search-x' : 'i-lucide-triangle-alert'"
        class="size-12 text-muted"
      />
      <h1 class="mt-4 text-2xl font-semibold text-highlighted">
        {{ state === 'not-found' ? 'Event not found' : 'Something went wrong' }}
      </h1>
      <p class="mt-2 text-muted">
        {{ state === 'not-found'
          ? 'There is no event of yours at this address.'
          : 'We couldn\'t load the event. Try again in a moment.' }}
      </p>
      <div class="mt-6 flex gap-2">
        <UButton
          v-if="state === 'error'"
          label="Try again"
          icon="i-lucide-refresh-cw"
          @click="state = 'loading'; load()"
        />
        <UButton
          to="/"
          label="All events"
          color="neutral"
          variant="outline"
        />
      </div>
    </div>

    <div
      v-else
      class="space-y-8"
    >
      <AdminEventLinks
        :name="event.name"
        :slug="event.slug"
      />

      <UTabs
        v-model="tab"
        :items="tabItems"
        :content="false"
        class="w-full"
      />

      <AdminQuestionnaireEditor
        v-show="tab === 'questionnaire'"
        :slug="event.slug"
        :questionnaire="event.questionnaire"
        :participant-count="event.participantCount"
        @saved="onSaved"
      />
      <AdminParticipantsTable
        v-if="tab === 'participants'"
        :slug="event.slug"
        @count="onParticipantCount"
      />
      <AdminRoundsList
        v-if="tab === 'rounds'"
        :slug="event.slug"
      />
    </div>
  </UContainer>
</template>
