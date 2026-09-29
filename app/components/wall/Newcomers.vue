<script setup lang="ts">
const props = defineProps<{
  // Newest first, only people registered after the latest round.
  participants: WallParticipant[]
  freshNumbers: Set<number>
}>()

const LIMIT = 8
const shown = computed(() => props.participants.slice(0, LIMIT))
const more = computed(() => Math.max(0, props.participants.length - LIMIT))
</script>

<template>
  <section class="flex shrink-0 flex-col gap-[0.6vw] border-t border-rv-border pt-[1vw]">
    <p class="font-mono-rv text-[clamp(13px,1vw,20px)] font-medium whitespace-pre text-rv-muted">
      <span class="text-rv-pink">$</span> git stash  <span class="text-rv-card-muted"># waiting for next round</span>
    </p>
    <div class="flex min-w-0 items-center gap-[0.7vw]">
      <div
        v-for="participant in shown"
        :key="participant.number"
        class="flex max-w-[12vw] min-w-0 items-center gap-[0.5vw] rounded-[0.7vw] border bg-rv-surface px-[0.7vw] py-[0.5vw]"
        :class="freshNumbers.has(participant.number) ? 'animate-rv-card-in border-rv-green' : 'border-rv-border'"
      >
        <span
          class="flex size-[2vw] shrink-0 items-center justify-center rounded-[0.5vw] bg-rv-surface-3 font-mono-rv text-[0.75vw] font-bold"
          aria-hidden="true"
        >
          <span
            v-if="participant.emoji"
            class="font-emoji text-[1.2vw] font-normal"
          >{{ participant.emoji }}</span>
          <template v-else>{{ initials(participant.name) }}</template>
        </span>
        <span class="truncate text-[clamp(13px,1vw,20px)] font-bold">{{ participant.name }}</span>
      </div>
      <span
        v-if="more"
        class="shrink-0 font-mono-rv text-[clamp(13px,1vw,20px)] font-medium text-rv-muted"
      >+{{ more }} more</span>
    </div>
  </section>
</template>
