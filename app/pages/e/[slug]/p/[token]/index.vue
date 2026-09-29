<script setup lang="ts">
import type { LogLine } from '~/components/rv/InstallLog.vue'

definePageMeta({ layout: 'bare' })

type State = 'loading' | 'not-found' | 'error' | 'failed' | 'retrying' | 'ok'
type View = 'card' | 'package.json'

const VIEWS = ['card', 'package.json'] as const
const RETRY_LINES: LogLine[] = [
  { text: 'deprecated small-talk@1.0.0', tone: 'warn' },
  { text: 'rereading your answers…' },
  { text: 'checking sense of humor…', tone: 'ok' },
  { text: 'installing title@latest…', tone: 'strong' }
]

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const token = computed(() => String(route.params.token))
const endpoint = computed(() => `/api/events/${slug.value}/p/${token.value}`)

const state = ref<State>('loading')
const profile = ref<PublicProfile>()
const loadError = ref('')
const retryError = ref('')
const retryDone = ref(false)
const view = ref<View>('card')

const tokens = useParticipantTokens()

useSeoMeta({
  title: () => profile.value?.title ? `${profile.value.title} · Rendez-Vue` : 'Your profile · Rendez-Vue'
})

function show(result: PublicProfile) {
  profile.value = result
  tokens.save(slug.value, { token: token.value, name: result.name })
  state.value = result.aiStatus === 'ok' ? 'ok' : 'failed'
}

async function load() {
  state.value = 'loading'
  try {
    show(await $fetch<PublicProfile>(endpoint.value))
  } catch (error) {
    if (apiErrorStatus(error) === 404) {
      // Removed by the organizer: forget it, so the landing page stops offering "welcome back".
      if (tokens.get(slug.value)?.token === token.value) {
        tokens.remove(slug.value)
      }
      state.value = 'not-found'
    } else {
      loadError.value = userErrorMessage(error, 'could not reach the registry')
      state.value = 'error'
    }
  }
}

async function retry() {
  retryError.value = ''
  retryDone.value = false
  state.value = 'retrying'
  try {
    const [result] = await Promise.all([
      $fetch<PublicProfile>(`${endpoint.value}/regenerate`, { method: 'POST' }),
      wait(2500)
    ])
    if (result.aiStatus !== 'ok') {
      retryError.value = 'title generation failed again'
      profile.value = result
      state.value = 'failed'
      return
    }
    retryDone.value = true
    await wait(400)
    show(result)
  } catch (error) {
    if (apiErrorStatus(error) === 409) {
      await load()
      return
    }
    retryError.value = apiErrorMessage(error, 'title generation failed again')
    state.value = 'failed'
  }
}

const copied = ref<'json' | 'link' | null>(null)
const copyFailed = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

async function copy(text: string, what: 'json' | 'link') {
  try {
    await navigator.clipboard.writeText(text)
    copyFailed.value = false
    copied.value = what
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copied.value = null
    }, 1500)
  } catch {
    copyFailed.value = true
  }
}

const currentUrl = () => window.location.href

const json = computed(() => profile.value ? packageJson(profile.value) : {})

// Background refresh for the match block; silent, never touches state/view.
useVisiblePolling(async () => {
  try {
    const result = await $fetch<PublicProfile>(endpoint.value)
    if (state.value === 'ok' && result.aiStatus === 'ok') profile.value = result
  } catch { /* keep the last known profile */ }
}, 5000, computed(() => state.value === 'ok'))

onMounted(load)
onBeforeUnmount(() => clearTimeout(copiedTimer))
</script>

<template>
  <RvScreen>
    <template v-if="state === 'loading'">
      <RvPrompt>
        <span class="flex items-center gap-2">$ npm view {{ slug }} <RvCursor /></span>
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
      <RvPrompt>$ npm view {{ slug }}</RvPrompt>
      <p class="font-mono-rv text-xs text-rv-pink">
        npm ERR! network {{ loadError }}
      </p>
      <h1 class="mt-24 text-[32px] leading-[1.05] font-bold tracking-[-1px]">
        Couldn't fetch your profile.
      </h1>
      <p class="text-[17px] leading-normal text-pretty text-rv-text-2">
        Probably the conference Wi-Fi. Your profile is safe, give it another try.
      </p>
      <div class="mt-auto">
        <RvButton
          variant="ghost"
          @click="load"
        >
          npm view --retry
        </RvButton>
      </div>
    </template>

    <template v-else-if="state === 'failed'">
      <RvPrompt><span class="text-rv-pink">npm ERR! title generation failed</span></RvPrompt>
      <h1 class="mt-24 text-[32px] leading-[1.05] font-bold tracking-[-1px]">
        Our AI got<br><span class="text-rv-pink">stage fright.</span>
      </h1>
      <p class="text-[17px] leading-normal text-pretty text-rv-text-2">
        Your answers are saved. Give it another go.
      </p>
      <div class="mt-auto flex flex-col gap-3">
        <RvButton @click="retry">
          npm i friends --retry
        </RvButton>
        <p
          v-if="retryError"
          class="text-center font-mono-rv text-xs text-rv-pink"
          role="alert"
        >
          npm ERR! {{ retryError }}
        </p>
      </div>
    </template>

    <RvInstallLog
      v-else-if="state === 'retrying'"
      prompt="$ npm i friends --retry"
      :lines="RETRY_LINES"
      footer="judging your npm takes, respectfully"
      :done="retryDone"
    >
      Compiling your<br><span class="text-rv-green">title</span>…
    </RvInstallLog>

    <template v-else-if="state === 'ok' && profile">
      <p class="font-mono-rv text-xs font-medium text-rv-green">
        + added 3 friends in 1.2s
      </p>

      <RvSegmented
        v-model="view"
        :options="VIEWS"
        label="Profile format"
      />

      <RvProfileCard
        v-if="view === 'card'"
        :profile="profile"
        :token="token"
      />

      <template v-else>
        <RvPackageJson :value="json" />
        <div class="flex items-center gap-3">
          <p class="flex-1 text-sm leading-normal text-pretty text-rv-text-2">
            Same you, different format. Tap to copy and flex it on Slack.
          </p>
          <div class="w-28 shrink-0">
            <RvButton
              variant="ghost"
              @click="copy(JSON.stringify(json, null, 2), 'json')"
            >
              {{ copied === 'json' ? 'copied ✓' : 'copy' }}
            </RvButton>
          </div>
        </div>
      </template>

      <p
        v-if="copyFailed"
        class="font-mono-rv text-xs text-rv-pink"
        role="alert"
      >
        npm ERR! copy failed
      </p>

      <RvMatchFound
        v-if="profile.match"
        :round-number="profile.match.roundNumber"
        :to="`/e/${slug}/p/${token}/match`"
      />
      <RvWaiting
        v-else
        :latest-round="profile.latestRoundNumber"
      />

      <p class="flex justify-center gap-1.5 font-mono-rv text-xs text-rv-muted">
        <button
          type="button"
          class="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rv-green"
          @click="copy(currentUrl(), 'link')"
        >
          {{ copied === 'link' ? 'copied ✓' : 'copy profile link' }}
        </button>
        <span>· saved on this device</span>
      </p>
    </template>
  </RvScreen>
</template>
