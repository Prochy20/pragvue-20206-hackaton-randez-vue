<script setup lang="ts">
const props = defineProps<{
  // you = the viewer (pink avatar), match = a group member (green avatar + border), removed = deleted member
  tone: 'you' | 'match' | 'removed'
  initials: string
  title: string
  label: string
  // Trio layout: three columns, smaller avatar and type.
  compact?: boolean
}>()

const avatarTone = computed(() => ({
  you: 'bg-rv-pink text-rv-bg',
  match: 'bg-rv-green text-rv-bg',
  removed: 'border border-dashed border-rv-border-2 text-rv-muted'
})[props.tone])
</script>

<template>
  <div
    class="flex min-w-0 flex-col rounded-[14px] border bg-rv-surface"
    :class="[
      tone === 'match' ? 'border-rv-green' : 'border-rv-border',
      compact ? 'gap-2 p-2.5' : 'gap-2.5 p-3.5'
    ]"
  >
    <div
      class="flex shrink-0 items-center justify-center font-mono-rv font-bold"
      :class="[avatarTone, compact ? 'size-9 rounded-[10px] text-[13px]' : 'size-11 rounded-xl text-base']"
      aria-hidden="true"
    >
      {{ initials }}
    </div>
    <p
      class="font-bold text-balance break-words"
      :class="[
        compact ? 'text-[13px] leading-[1.2]' : 'text-[15px] leading-[1.2]',
        tone === 'removed' && 'text-rv-muted'
      ]"
    >
      {{ title }}
    </p>
    <p class="truncate font-mono-rv text-[11px] text-rv-muted">
      {{ label }}
    </p>
  </div>
</template>
