<script setup lang="ts">
import type { LogLine } from '~/components/rv/InstallLog.vue'

definePageMeta({ layout: 'bare' })

type State = 'loading' | 'not-found' | 'error' | 'installing' | 'match'

const INSTALL_LINES: LogLine[] = [
  { text: 'deprecated small-talk@1.0.0', tone: 'warn' },
  { text: 'resolving attendees…' },
  { text: 'checking peerDependencies…', tone: 'ok' },
  { text: 'installing friend@latest…', tone: 'strong' }
]

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const token = computed(() => String(route.params.token))
const endpoint = computed(() => `/api/events/${slug.value}/p/${token.value}`)
const profileTo = computed(() => `/e/${slug.value}/p/${token.value}`)

const state = ref<State>('loading')
const profile = ref<PublicProfile>()
const loadError = ref('')
const installDone = ref(false)
const commitHash = ref<string | null>(null)

const seen = useSeenRounds()

const match = computed(() => profile.value?.match ?? null)

useSeoMeta({ title: 'Your match · Rendez-Vue' })

async function load() {
  state.value = 'loading'
  let result: PublicProfile
  try {
    result = await $fetch<PublicProfile>(endpoint.value)
  } catch (error) {
    if (apiErrorStatus(error) === 404) {
      state.value = 'not-found'
    } else {
      loadError.value = apiErrorMessage(error, 'could not reach the registry')
      state.value = 'error'
    }
    return
  }

  profile.value = result
  if (!result.match) {
    await navigateTo(profileTo.value, { replace: true })
    return
  }
  if (seen.has(result.match.roundId)) {
    state.value = 'match'
    return
  }

  // First reveal of this round: the install log is part of the joke.
  installDone.value = false
  state.value = 'installing'
  await wait(2500)
  installDone.value = true
  await wait(400)
  seen.add(result.match.roundId)
  state.value = 'match'
}

function commit() {
  if (!match.value) return
  commitHash.value = hashString(match.value.roundId + token.value).toString(16).padStart(7, '0').slice(0, 7)
}

onMounted(load)
</script>

<template>
  <RvScreen>
    <template v-if="state === 'loading'">
      <RvPrompt>
        <span class="flex items-center gap-2">$ npm install <RvCursor /></span>
      </RvPrompt>
    </template>

    <template v-else-if="state === 'not-found'">
      <RvPrompt><span class="text-rv-pink">npm ERR! 404</span></RvPrompt>
      <h1 class="mt-24 text-[32px] leading-[1.05] font-bold tracking-[-1px]">
        This profile isn't installed.
      </h1>
      <p class="text-[17px] leading-normal text-pretty text-rv-text-2">
        The link might be mistyped, or this profile belongs to a different event. Registering takes about three minutes.
      </p>
      <div class="mt-auto">
        <RvButton
          variant="ghost"
          :to="`/e/${slug}`"
        >
          cd ~/registration →
        </RvButton>
      </div>
    </template>

    <template v-else-if="state === 'error'">
      <RvPrompt>$ npm install</RvPrompt>
      <p class="font-mono-rv text-xs text-rv-pink">
        npm ERR! friend not found — {{ loadError }}
      </p>
      <h1 class="mt-24 text-[32px] leading-[1.05] font-bold tracking-[-1px]">
        Couldn't fetch your match.
      </h1>
      <p class="text-[17px] leading-normal text-pretty text-rv-text-2">
        Probably the conference Wi-Fi. Your match is safe, give it another try.
      </p>
      <div class="mt-auto flex flex-col gap-3">
        <RvButton
          variant="ghost"
          @click="load"
        >
          npm install --retry
        </RvButton>
        <p class="text-center font-mono-rv text-xs text-rv-muted">
          <NuxtLink
            :to="profileTo"
            class="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rv-green"
          >
            cd ~/profile
          </NuxtLink>
        </p>
      </div>
    </template>

    <RvInstallLog
      v-else-if="state === 'installing'"
      prompt="$ npm install"
      :lines="INSTALL_LINES"
      footer="comparing incident reports, respectfully"
      :done="installDone"
    >
      Looking for your<br><span class="text-rv-green">peerDependency</span>…
    </RvInstallLog>

    <RvMatch
      v-else-if="state === 'match' && profile && match"
      :profile="profile"
      :match="match"
      :profile-to="profileTo"
      :commit-hash="commitHash"
      @commit="commit"
    />
  </RvScreen>
</template>
