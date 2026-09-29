<script setup lang="ts">
import type { StepOneState } from '~/components/rv/StepOne.vue'
import type { LogLine } from '~/components/rv/InstallLog.vue'

definePageMeta({ layout: 'bare' })

const MIN_INSTALL_MS = 2500

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const tokens = useParticipantTokens()

const { data: event, error: loadError, status, refresh } = await useFetch<PublicEvent>(() => `/api/events/${slug.value}`)

useSeoMeta({ title: () => event.value ? `${event.value.name} · Rendez-Vue` : 'Rendez-Vue' })

type Step = 'landing' | 'about' | 'quiz' | 'installing'
const step = ref<Step>('landing')
const about = ref<StepOneState>({ name: '', role: '', company: '', hereFor: [] })
const answers = ref<Record<string, string>>({})
const quizIndex = ref(0)
const submitError = ref<string>()
const QUESTIONS_CHANGED_MSG = 'questions changed while you were answering, please go through them again'
// The reset notice only makes sense on the first card; drop it once the participant moves on,
// so the second pass doesn't read as already failed.
watch(quizIndex, (index) => {
  if (index > 0 && submitError.value === QUESTIONS_CHANGED_MSG) {
    submitError.value = undefined
  }
})
const installDone = ref(false)

// localStorage only exists on the client, so the returning check runs after mount.
// The stored token is verified first, so a profile the organizer deleted doesn't get a "welcome back".
const returning = ref<{ name: string, profileUrl: string }>()
const checkingReturning = ref(false)
onMounted(async () => {
  const stored = tokens.get(slug.value)
  if (!stored) {
    return
  }
  checkingReturning.value = true
  let name = stored.name
  try {
    name = (await $fetch<PublicProfile>(`/api/events/${slug.value}/p/${stored.token}`)).name
  } catch (error) {
    if (apiErrorStatus(error) === 404) {
      if (tokens.get(slug.value)?.token === stored.token) {
        tokens.remove(slug.value)
      }
      checkingReturning.value = false
      return
    }
    // Network trouble: trust the device and keep offering the profile.
  }
  returning.value = { name, profileUrl: `/e/${slug.value}/p/${stored.token}` }
  checkingReturning.value = false
})

function forget() {
  tokens.remove(slug.value)
  returning.value = undefined
}

const installLines = computed<LogLine[]>(() => [
  { text: 'deprecated small-talk@1.0.0', tone: 'warn' },
  // Same count as the quiz counter (name and role are step 1, not questions).
  { text: `resolving ${event.value?.questionnaire.length ?? 0} answers…` },
  { text: 'checking vibes…', tone: 'ok' },
  { text: 'humor: gentle mode enabled', tone: 'warn' },
  { text: 'installing title@latest…', tone: 'strong' }
])

async function submit() {
  if (!event.value) {
    return
  }
  step.value = 'installing'
  installDone.value = false
  submitError.value = undefined
  try {
    const body: RegistrationInput = {
      name: about.value.name,
      role: about.value.role,
      company: about.value.company.trim() || undefined,
      hereFor: about.value.hereFor,
      answers: answers.value
    }
    const [result] = await Promise.all([
      $fetch<RegistrationResult>(`/api/events/${slug.value}/participants`, { method: 'POST', body }),
      wait(MIN_INSTALL_MS)
    ])
    tokens.save(slug.value, { token: result.token, name: about.value.name.trim() })
    installDone.value = true
    await wait(400)
    await navigateTo(`/e/${slug.value}/p/${result.token}`)
  } catch (error) {
    if (apiErrorMessage(error) === QUESTIONNAIRE_CHANGED) {
      // Reload the new questions and run the quiz again instead of failing the same way forever.
      await refresh()
      answers.value = {}
      quizIndex.value = 0
      submitError.value = QUESTIONS_CHANGED_MSG
      step.value = 'quiz'
      return
    }
    submitError.value = userErrorMessage(error, 'install failed, check your connection')
    step.value = 'quiz'
  }
}
</script>

<template>
  <RvScreen>
    <template v-if="status === 'pending' && !event">
      <RvPrompt>$ npm view {{ slug }} <span class="animate-rv-blink text-rv-green">▍</span></RvPrompt>
    </template>

    <template v-else-if="!event">
      <RvPrompt>
        <span class="text-rv-pink">npm ERR! {{ apiErrorStatus(loadError) === 404 ? '404' : 'network' }}</span>
      </RvPrompt>
      <h1 class="mt-24 text-[32px] leading-[1.05] font-bold tracking-[-1px]">
        {{ apiErrorStatus(loadError) === 404 ? 'No event at this address.' : 'Couldn\'t reach the event.' }}
      </h1>
      <p class="text-[17px] leading-normal text-rv-text-2">
        {{ apiErrorStatus(loadError) === 404 ? 'Check the link or QR code you got from the organizer.' : 'Check your connection and try again.' }}
      </p>
      <div
        v-if="apiErrorStatus(loadError) !== 404"
        class="mt-auto"
      >
        <RvButton @click="refresh()">
          npm retry →
        </RvButton>
      </div>
    </template>

    <RvLanding
      v-else-if="step === 'landing'"
      :event="event"
      :returning="returning"
      :checking="checkingReturning"
      @start="step = 'about'"
      @forget="forget"
    />

    <RvStepOne
      v-else-if="step === 'about'"
      v-model="about"
      @next="step = 'quiz'"
    />

    <RvQuiz
      v-else-if="step === 'quiz'"
      v-model="answers"
      v-model:index="quizIndex"
      :questions="event.questionnaire"
      :error="submitError"
      @back="step = 'about'"
      @submit="submit"
    />

    <RvInstallLog
      v-else
      prompt="$ npm i friends"
      :lines="installLines"
      :done="installDone"
      footer="judging your npm takes, respectfully"
    >
      Compiling your<br><span class="text-rv-green">title</span>…
    </RvInstallLog>
  </RvScreen>
</template>
