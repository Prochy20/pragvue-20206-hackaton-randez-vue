<script setup lang="ts">
defineProps<{
  event: PublicEvent
  // Set when this device already registered for the event.
  returning?: { name: string, profileUrl: string }
  // Stored registration still being verified: hold the intro and CTA back instead of flipping them later.
  checking?: boolean
}>()

const emit = defineEmits<{
  start: []
  forget: []
}>()
</script>

<template>
  <div class="flex justify-between font-mono-rv text-[11px] font-medium text-rv-muted">
    <span>~/{{ event.slug }}</span>
    <span class="text-rv-green">● online</span>
  </div>

  <div class="mt-24 flex flex-col gap-3.5">
    <h1 class="text-[56px] leading-[0.95] font-bold tracking-[-2px]">
      Rendez-<span class="text-rv-green">Vue</span>
    </h1>
    <p class="flex items-center gap-2.5 font-mono-rv text-lg font-medium">
      <span class="text-rv-pink">$</span>
      <span>npm i friends</span>
      <RvCursor />
    </p>
  </div>

  <p
    v-if="returning"
    class="mt-3 text-[17px] leading-normal text-pretty text-rv-text-2"
  >
    Welcome back, <span class="font-semibold text-rv-text">{{ returning.name }}</span>. Your profile is already installed on this device.
  </p>
  <p
    v-else
    class="mt-3 text-[17px] leading-normal text-pretty text-rv-text-2"
    :class="{ invisible: checking }"
  >
    Answer {{ event.questionnaire.length + 2 }} slightly unhinged questions. Get a title. Meet one person at {{ event.name }} you'll actually want to talk to.
  </p>

  <div
    class="mt-auto flex flex-col gap-3"
    :class="{ invisible: checking }"
  >
    <template v-if="returning">
      <RvButton :to="returning.profileUrl">
        cd ~/my-profile →
      </RvButton>
      <button
        type="button"
        class="text-center font-mono-rv text-xs text-rv-muted underline-offset-4 hover:underline"
        @click="emit('forget')"
      >
        not you? register someone else
      </button>
    </template>
    <template v-else>
      <RvButton @click="emit('start')">
        npx rendez-vue →
      </RvButton>
      <p class="text-center font-mono-rv text-xs text-rv-muted">
        ~3 min · gentle teasing, no roasts
      </p>
    </template>
  </div>
</template>
