<script setup lang="ts">
defineProps<{
  eventName: string
  slug: string
  count: number
}>()
</script>

<template>
  <header class="flex items-end justify-between gap-[2vw]">
    <div class="flex min-w-0 flex-col gap-[0.5vw]">
      <p class="flex items-baseline gap-[1vw] font-mono-rv text-[clamp(12px,0.9vw,18px)] font-medium text-rv-muted">
        <span class="font-grotesk text-[clamp(14px,1.1vw,22px)] font-bold tracking-tight text-rv-text">Rendez-<span class="text-rv-green">Vue</span></span>
        <span>~/{{ slug }}</span>
      </p>
      <h1 class="truncate text-[clamp(32px,3.4vw,68px)] leading-[0.95] font-bold tracking-[-0.03em]">
        {{ eventName }}
      </h1>
      <p class="flex items-center gap-[0.6vw] font-mono-rv text-[clamp(18px,1.6vw,32px)] font-medium">
        <span class="text-rv-pink">$</span>
        <span>npm i friends</span>
        <RvCursor class="h-[1em]! w-[0.5em]!" />
      </p>
    </div>
    <p class="shrink-0 text-right font-mono-rv text-[clamp(14px,1.2vw,24px)] font-medium text-rv-muted">
      <span class="block font-grotesk text-[clamp(40px,4.4vw,88px)] leading-none font-bold text-rv-green tabular-nums">{{ count }}</span>
      {{ count === 1 ? 'friend' : 'friends' }} installed
    </p>
  </header>
</template>
