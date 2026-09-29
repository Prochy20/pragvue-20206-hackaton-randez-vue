<script setup lang="ts">
defineProps<{
  // Set when a round already ran without this participant (registered after it).
  latestRound?: number | null
}>()
</script>

<template>
  <div class="mt-auto flex flex-col gap-2.5 rounded-2xl border border-rv-border p-4 font-mono-rv text-xs">
    <p class="text-rv-muted">
      $ npm find-match
    </p>
    <template v-if="latestRound">
      <p class="text-rv-muted">
        round {{ latestRound }} shipped before you installed
      </p>
      <p
        class="flex items-center gap-2 text-rv-text-2"
        role="status"
      >
        You'll be matched in the next round.
        <RvCursor />
      </p>
    </template>
    <p
      v-else
      class="flex items-center gap-2 text-rv-text-2"
      role="status"
    >
      waiting for the next matching round…
      <RvCursor />
    </p>
    <p class="font-grotesk text-[13px] leading-normal text-pretty text-rv-muted">
      The organizer runs matching rounds. Keep this page open or come back later.
    </p>
  </div>
</template>
