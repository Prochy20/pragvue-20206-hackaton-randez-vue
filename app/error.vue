<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({ title: () => notFound.value ? 'Not found · Rendez-Vue' : 'Error · Rendez-Vue' })
</script>

<template>
  <RvScreen>
    <RvPrompt>
      $ cd {{ useRoute().path }}
    </RvPrompt>
    <p class="font-mono-rv text-xs text-rv-pink">
      npm ERR! {{ error.statusCode || 500 }}
    </p>
    <h1 class="mt-24 text-[32px] leading-[1.05] font-bold tracking-[-1px]">
      {{ notFound ? 'Nothing installed here.' : 'Something crashed.' }}
    </h1>
    <p class="text-[17px] leading-normal text-pretty text-rv-text-2">
      {{ notFound
        ? 'The link might be mistyped. Check the QR code or link you got from the organizer.'
        : 'That one is on us. Try again in a moment.' }}
    </p>
    <div class="mt-auto">
      <RvButton
        variant="ghost"
        @click="clearError({ redirect: '/' })"
      >
        cd ~ →
      </RvButton>
    </div>
  </RvScreen>
</template>
