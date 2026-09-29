<script setup lang="ts">
import { renderSVG } from 'uqr'

const props = defineProps<{
  url: string
  // Empty wall: the QR is the whole show.
  large?: boolean
}>()

// Hex, not CSS vars: SVG presentation attributes don't resolve var().
const svg = computed(() => renderSVG(props.url, { border: 3, whiteColor: '#eef3ee', blackColor: '#0f1510' }))
const shortUrl = computed(() => props.url.replace(/^https?:\/\//, ''))
</script>

<template>
  <aside
    class="flex flex-col font-mono-rv"
    :class="large ? 'items-center gap-[1.2vw]' : 'gap-[0.8vw]'"
  >
    <p
      class="font-medium text-rv-muted"
      :class="large ? 'text-[clamp(16px,1.4vw,28px)]' : 'text-[clamp(12px,0.95vw,19px)]'"
    >
      <span class="text-rv-pink">$</span> npx rendez-vue <span class="text-rv-green"># scan to join</span>
    </p>
    <!-- SVG generated locally by uqr, no user HTML. -->
    <!-- eslint-disable vue/no-v-html -->
    <div
      class="aspect-square overflow-hidden rounded-[1vw] [&>svg]:block [&>svg]:size-full"
      :class="large ? 'w-[min(26vw,46vh)]' : 'w-full'"
      role="img"
      :aria-label="`QR code for ${shortUrl}`"
      v-html="svg"
    />
    <!-- eslint-enable vue/no-v-html -->
    <p
      class="font-bold break-all text-rv-text"
      :class="large ? 'text-[clamp(18px,1.6vw,32px)]' : 'text-[clamp(13px,1vw,20px)]'"
    >
      {{ shortUrl }}
    </p>
  </aside>
</template>
