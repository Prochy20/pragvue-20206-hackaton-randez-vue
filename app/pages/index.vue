<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { FetchError } from 'ofetch'

definePageMeta({ middleware: 'auth' })

const state = reactive<Partial<CreateEventInput>>({ name: '' })
const loading = ref(false)
const error = ref<string>()

async function onSubmit(event: FormSubmitEvent<CreateEventInput>) {
  loading.value = true
  error.value = undefined
  try {
    const { slug } = await $fetch<CreatedEvent>('/api/events', { method: 'POST', body: event.data })
    await navigateTo(`/e/${slug}/admin`)
  } catch (e) {
    const fetchError = e as FetchError
    error.value = fetchError.data?.statusMessage ?? 'Something went wrong. Please try again.'
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <div class="max-w-2xl">
      <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-highlighted">
        Break the ice, with a little help from AI
      </h1>
      <p class="mt-4 text-lg text-muted">
        Attendees fill in a playful questionnaire, get a witty title, and get matched with people actually worth talking to.
      </p>
    </div>

    <UCard class="mt-12 max-w-md">
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">
          Create event
        </h2>
      </template>

      <UForm
        :schema="createEventSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Event name"
          name="name"
        >
          <UInput
            v-model="state.name"
            placeholder="PragVue 2026"
            autofocus
            class="w-full"
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="error"
        />

        <UButton
          type="submit"
          label="Create event"
          icon="i-lucide-plus"
          :loading="loading"
        />
      </UForm>

      <template #footer>
        <p class="text-sm text-muted">
          You'll get a private admin link – no account needed.
        </p>
      </template>
    </UCard>
  </UContainer>
</template>
