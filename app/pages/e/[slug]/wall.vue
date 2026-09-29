<script setup lang="ts">
definePageMeta({ layout: 'bare' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const joinUrl = computed(() => `${useRequestURL().origin}/e/${slug.value}`)

const { data, error } = await useFetch<WallData>(() => `/api/events/${slug.value}/wall`)

useSeoMeta({ title: () => data.value ? `${data.value.event.name} · Live wall` : 'Live wall' })

const notFound = computed(() => !data.value && error.value?.statusCode === 404)

// Poll every 4 s without overlapping requests. The projector is always visible, so no pause on hidden tabs.
const reconnecting = ref(false)
let pollTimer: ReturnType<typeof setInterval> | undefined
let inFlight = false

async function poll() {
  if (inFlight) return
  inFlight = true
  try {
    data.value = await $fetch<WallData>(`/api/events/${slug.value}/wall`)
    reconnecting.value = false
  } catch {
    reconnecting.value = true
  } finally {
    inFlight = false
  }
}

onMounted(() => {
  if (!notFound.value) pollTimer = setInterval(poll, 4000)
})

// Cards whose number wasn't in the previous data animate in; nothing animates on first load.
const freshNumbers = ref(new Set<number>())
watch(() => data.value?.participants, (list, previous) => {
  if (!list || !previous) return
  const known = new Set(previous.map(p => p.number))
  freshNumbers.value = new Set(list.map(p => p.number).filter(n => !known.has(n)))
})

// Round intro: 'matching' while a round runs, 'merged' for 3 s after a new round appears (not on first load).
const showMerged = ref(false)
let mergedTimer: ReturnType<typeof setTimeout> | undefined

watch(() => data.value ? (data.value.round?.number ?? null) : undefined, (number, previous) => {
  if (previous === undefined || number == null || number === previous) return
  showMerged.value = true
  clearTimeout(mergedTimer)
  mergedTimer = setTimeout(() => {
    showMerged.value = false
  }, 3000)
})

onBeforeUnmount(() => {
  clearInterval(pollTimer)
  clearTimeout(mergedTimer)
})

const introPhase = computed(() => showMerged.value ? 'merged' : data.value?.matching ? 'matching' : null)

const participants = computed(() => data.value?.participants ?? [])
const round = computed(() => data.value?.round ?? null)
const newcomers = computed(() => participants.value.filter(p => !p.inLatestRound))
const pairedCount = computed(() => participants.value.length - newcomers.value.length)
</script>

<template>
  <div class="h-dvh overflow-hidden bg-rv-bg font-grotesk text-rv-text antialiased">
    <div
      v-if="notFound"
      class="flex h-full flex-col items-center justify-center gap-[1vw] font-mono-rv text-[clamp(20px,2vw,40px)]"
    >
      <p class="text-rv-muted">
        <span class="text-rv-pink">$</span> open ~/{{ slug }}/wall
      </p>
      <p class="flex items-center gap-[0.6vw] font-bold text-rv-pink">
        404 event not found
        <RvCursor class="h-[1em]! w-[0.5em]!" />
      </p>
    </div>

    <div
      v-else-if="!data"
      class="flex h-full items-center justify-center font-mono-rv text-[clamp(18px,1.6vw,32px)] text-rv-pink"
    >
      npm ERR! wall offline, retrying…
    </div>

    <div
      v-else
      class="flex h-full gap-[2.5vw] p-[2.2vw]"
    >
      <main class="flex min-w-0 flex-1 flex-col gap-[1.6vw]">
        <WallHeader
          :event-name="data.event.name"
          :slug="data.event.slug"
          :count="participants.length"
        />

        <div
          v-if="!participants.length"
          class="flex min-h-0 flex-1 flex-col items-center justify-center gap-[2vw]"
        >
          <WallJoinPanel
            :url="joinUrl"
            large
          />
          <p class="flex items-center gap-[0.6vw] font-mono-rv text-[clamp(20px,2vw,40px)] font-medium text-rv-text-2">
            waiting for first friend…
            <RvCursor class="h-[1em]! w-[0.5em]!" />
          </p>
        </div>

        <template v-else-if="round">
          <div class="flex min-h-0 flex-1 flex-col">
            <!-- Mounted after the merge intro so the groups fade in on screen. -->
            <WallGroups
              v-if="!showMerged"
              :key="round.number"
              :groups="round.groups"
              :round-number="round.number"
            />
          </div>
          <WallNewcomers
            v-if="newcomers.length"
            :participants="newcomers"
            :fresh-numbers="freshNumbers"
          />
        </template>

        <div
          v-else
          class="min-h-0 flex-1"
        >
          <WallGrid
            :participants="participants"
            :fresh-numbers="freshNumbers"
          />
        </div>
      </main>

      <WallJoinPanel
        v-if="participants.length"
        :url="joinUrl"
        class="w-[clamp(220px,17vw,360px)] shrink-0"
      />
    </div>

    <WallRoundIntro
      v-if="data && introPhase"
      :phase="introPhase"
      :round-number="introPhase === 'merged' ? (round?.number ?? null) : null"
      :group-count="round?.groups.length ?? 0"
      :participant-count="introPhase === 'merged' ? pairedCount : participants.length"
    />

    <p
      v-if="reconnecting"
      class="fixed bottom-[1vw] left-[1.2vw] z-50 font-mono-rv text-[clamp(12px,0.9vw,18px)] font-medium text-rv-yellow"
      role="status"
    >
      ● reconnecting
    </p>
  </div>
</template>
