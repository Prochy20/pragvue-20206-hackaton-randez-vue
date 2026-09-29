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
      <p class="font-mono-rv text-sm text-muted">
        <span class="text-rv-pink">$</span> rendez-vue events
      </p>
      <h1 class="mt-2 font-grotesk text-4xl font-bold tracking-tight text-highlighted sm:text-5xl">
        Your events
      </h1>
      <p class="mt-4 text-lg text-muted">
        Create an event, tweak the questions, share the registration link.
      </p>
    </div>

    <div class="mt-12 grid items-start gap-8 lg:grid-cols-2">
      <UCard class="w-full">
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
      </UCard>

      <AdminEventList />
    </div>
  </UContainer>
</template>
