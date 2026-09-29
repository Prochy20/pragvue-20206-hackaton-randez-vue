<script setup lang="ts">
definePageMeta({ layout: 'bare' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data } = await useFetch<WallData>(() => `/api/events/${slug.value}/wall`)

useSeoMeta({ title: () => data.value ? `${data.value.event.name} · Live wall` : 'Live wall' })
</script>

<template>
  <div class="h-dvh overflow-hidden bg-rv-bg font-grotesk text-rv-text antialiased">
    <!-- Built in phase 5, T2. -->
  </div>
</template>
