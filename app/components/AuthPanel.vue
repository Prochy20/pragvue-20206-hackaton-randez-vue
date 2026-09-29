<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  mode: 'login' | 'signup'
}>()

const { fetch: refreshSession } = useUserSession()
const loading = ref(false)
const error = ref<string>()

const copy = computed(() => props.mode === 'login'
  ? { title: 'Log in', submit: 'Log in', switchText: 'No account yet?', switchLabel: 'Sign up', switchTo: '/signup' }
  : { title: 'Create an account', submit: 'Sign up', switchText: 'Already have an account?', switchLabel: 'Log in', switchTo: '/login' })

const fields = [
  { name: 'email', type: 'email' as const, label: 'Email', placeholder: 'you@example.com', required: true },
  { name: 'password', type: 'password' as const, label: 'Password', placeholder: 'At least 8 characters', required: true }
]

async function onSubmit(event: FormSubmitEvent<Credentials>) {
  loading.value = true
  error.value = undefined
  try {
    await $fetch(`/api/auth/${props.mode}`, { method: 'POST', body: event.data })
    await refreshSession()
    await navigateTo('/')
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
        :schema="credentialsSchema"
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
            :to="copy.switchTo"
            class="font-medium text-primary"
          >
            {{ copy.switchLabel }}
          </ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </UContainer>
</template>
