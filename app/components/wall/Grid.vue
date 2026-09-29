<script setup lang="ts">
const props = defineProps<{
  participants: WallParticipant[]
  freshNumbers: Set<number>
}>()

// Fixed rows per tier keep card size stable while people trickle in; 56 cards still fit 1920×1080.
const layout = computed(() => {
  const count = props.participants.length
  if (count <= 12) return { tier: 'lg' as const, cols: 4, rows: 3 }
  if (count <= 30) return { tier: 'md' as const, cols: 6, rows: 5 }
  if (count <= 56) return { tier: 'sm' as const, cols: 8, rows: 7 }
  return { tier: 'sm' as const, cols: 10, rows: Math.ceil(count / 10) }
})
</script>

<template>
  <div
    class="grid h-full min-h-0 overflow-hidden"
    :class="layout.tier === 'lg' ? 'gap-[1.2vw]' : 'gap-[0.7vw]'"
    :style="{
      gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`
    }"
  >
    <WallCard
      v-for="participant in participants"
      :key="participant.number"
      :participant="participant"
      :tier="layout.tier"
      :fresh="freshNumbers.has(participant.number)"
    />
  </div>
</template>
