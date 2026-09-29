<script setup lang="ts">
defineProps<{
  roundNumber: number
  to: string
}>()
</script>

<template>
  <div class="mt-auto flex animate-rv-fade-in flex-col gap-3 rounded-2xl border border-rv-green p-4 font-mono-rv text-xs">
    <p class="text-rv-muted">
      $ npm find-match
    </p>
    <p
      class="font-medium text-rv-green"
      role="status"
    >
      ✓ match found <span class="text-rv-muted">(round {{ roundNumber }})</span>
    </p>
    <p class="font-grotesk text-[13px] leading-normal text-pretty text-rv-text-2">
      Someone here compiles cleanly with you. Go find out who.
    </p>
    <RvButton :to="to">
      npm install friend →
    </RvButton>
  </div>
</template>
