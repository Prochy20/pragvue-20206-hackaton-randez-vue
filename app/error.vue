<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const route = useRoute()
const notFound = computed(() => props.error.statusCode === 404)
const unauthorized = computed(() => props.error.statusCode === 401)
const forbidden = computed(() => props.error.statusCode === 403)

// Coming back to a raw API URL after login would only show JSON, so those go to the dashboard.
const loginTarget = computed(() => route.path === '/' || route.path.startsWith('/api/')
  ? '/login'
  : `/login?redirect=${encodeURIComponent(route.fullPath)}`)

const copy = computed(() => {
  if (notFound.value) {
    return { title: 'Nothing installed here.', text: 'The link might be mistyped. Check the QR code or link you got from the organizer.' }
  }
  if (unauthorized.value) {
    return { title: 'Permission denied.', text: 'You need to log in to see this page.' }
  }
  if (forbidden.value) {
    return { title: 'Access denied.', text: 'Your account doesn\'t have access to this page.' }
  }
  return { title: 'Something crashed.', text: 'That one is on us. Try again in a moment.' }
})

// Participants have no business on "/" (organizer login), so inside an event go back to its landing.
const home = computed(() => {
  const match = route.path.match(/^\/e\/([^/]+)\/./)
  return match ? `/e/${match[1]}` : '/'
})

useSeoMeta({
  title: () => notFound.value
    ? 'Not found · Rendez-Vue'
    : unauthorized.value || forbidden.value ? 'Access denied · Rendez-Vue' : 'Error · Rendez-Vue'
})
</script>

<template>
  <RvScreen>
    <RvPrompt>
      $ cd {{ route.path }}
    </RvPrompt>
    <p class="font-mono-rv text-xs text-rv-pink">
      npm ERR! {{ error.statusCode || 500 }}
    </p>
    <h1 class="mt-24 text-[32px] leading-[1.05] font-bold tracking-[-1px]">
      {{ copy.title }}
    </h1>
    <p class="text-[17px] leading-normal text-pretty text-rv-text-2">
      {{ copy.text }}
    </p>
    <div class="mt-auto">
      <RvButton
        v-if="unauthorized"
        @click="clearError({ redirect: loginTarget })"
      >
        npm login →
      </RvButton>
      <RvButton
        v-else
        variant="ghost"
        @click="clearError({ redirect: home })"
      >
        cd ~ →
      </RvButton>
    </div>
  </RvScreen>
</template>
