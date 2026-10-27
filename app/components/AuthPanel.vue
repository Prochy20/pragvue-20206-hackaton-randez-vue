<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  mode: 'login' | 'signup' | 'reset'
}>()

const { fetch: refreshSession } = useUserSession()
const route = useRoute()

// Only same-site paths, so a crafted ?redirect= can't bounce the user off the site.
const redirect = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : undefined
})
const loading = ref(false)
const error = ref<string>()

const COPY = {
  login: { title: 'Log in', submit: 'Log in', switchText: 'No account yet?', switchLabel: 'Sign up', switchTo: '/signup', endpoint: '/api/auth/login' },
  signup: { title: 'Create an account', submit: 'Sign up', switchText: 'Already have an account?', switchLabel: 'Log in', switchTo: '/login', endpoint: '/api/auth/signup' },
  reset: { title: 'Reset your password', submit: 'Set new password', switchText: 'Remembered it?', switchLabel: 'Log in', switchTo: '/login', endpoint: '/api/auth/reset-password' }
}
const copy = computed(() => COPY[props.mode])

const emailField = { name: 'email', type: 'email' as const, label: 'Email', placeholder: 'you@example.com', required: true }
const passwordField = { name: 'password', type: 'password' as const, label: 'Password', placeholder: 'At least 8 characters', required: true }
const fields = computed(() => props.mode === 'reset'
  ? [
      emailField,
      { ...passwordField, label: 'New password' },
      { name: 'resetKey', type: 'password' as const, label: 'Reset key', placeholder: 'Set by whoever runs this server', required: true }
    ]
  : [emailField, passwordField])
const schema = computed(() => props.mode === 'reset' ? passwordResetSchema : credentialsSchema)

async function onSubmit(event: FormSubmitEvent<Credentials | PasswordReset>) {
  loading.value = true
  error.value = undefined
  try {
    await $fetch(copy.value.endpoint, { method: 'POST', body: event.data })
    await refreshSession()
    await navigateTo(redirect.value ?? '/')
  } catch (e) {
    error.value = apiErrorMessage(e, 'Something went wrong. Please try again.')
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
    <div class="max-w-xl">
      <h1 class="font-grotesk text-5xl font-bold tracking-tight text-highlighted sm:text-6xl">
        Rendez-<span class="text-primary">Vue</span>
      </h1>
      <p class="mt-3 font-mono-rv text-lg">
        <span class="text-rv-pink">$</span> npm i friends
      </p>
      <p class="mt-6 text-lg text-muted">
        Attendees answer a few slightly unhinged questions, get an AI-generated title, and get matched with one person worth talking to. You run the event.
      </p>
    </div>

    <UPageCard class="w-full max-w-md lg:justify-self-end">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :title="copy.title"
        :submit="{ label: copy.submit }"
        :loading="loading"
        @submit="onSubmit"
      >
        <template #validation>
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :title="error"
          />
        </template>

        <template #footer>
          {{ copy.switchText }}
          <ULink
            :to="{ path: copy.switchTo, query: redirect ? { redirect } : {} }"
            class="font-medium text-primary"
          >
            {{ copy.switchLabel }}
          </ULink>
          <template v-if="mode === 'login'">
            <br>
            Forgot your password?
            <ULink
              to="/reset-password"
              class="font-medium text-primary"
            >
              Reset it
            </ULink>
          </template>
        </template>
      </UAuthForm>
    </UPageCard>
  </UContainer>
</template>
