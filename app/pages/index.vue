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

      <div class="flex items-center gap-3">
        <UButton
          label="Create event"
          icon="i-lucide-plus"
          disabled
        />
        <span class="text-sm text-muted">Coming soon</span>
      </div>
    </UCard>
  </UContainer>
</template>
