<script setup lang="ts">
const props = defineProps<{
  participant: WallParticipant
  tier: 'lg' | 'md' | 'sm'
  // Registered since the previous poll.
  fresh?: boolean
}>()

const avatarTones = ['bg-rv-green', 'bg-rv-pink', 'bg-rv-yellow']
const avatarTone = computed(() => props.participant.emoji ? 'bg-rv-surface-3' : avatarTones[props.participant.number % 3])
const titleMissing = computed(() => props.participant.aiStatus === 'failed' || !props.participant.title)

const sizes = computed(() => ({
  lg: {
    card: 'gap-[0.9vw] p-[1.3vw] rounded-[1.2vw]',
    head: 'flex-col items-start gap-[0.9vw]',
    avatar: 'size-[4.2vw] rounded-[1vw] text-[1.6vw]',
    emoji: 'text-[2.4vw]',
    name: 'text-[clamp(20px,2vw,40px)]',
    title: 'text-[clamp(15px,1.35vw,28px)] line-clamp-3'
  },
  md: {
    card: 'gap-[0.6vw] p-[0.9vw] rounded-[0.9vw]',
    head: 'items-center gap-[0.7vw]',
    avatar: 'size-[2.8vw] rounded-[0.7vw] text-[1.05vw]',
    emoji: 'text-[1.6vw]',
    name: 'text-[clamp(15px,1.3vw,26px)]',
    title: 'text-[clamp(12px,1vw,20px)] line-clamp-2'
  },
  sm: {
    card: 'gap-[0.35vw] p-[0.6vw] rounded-[0.7vw]',
    head: 'items-center gap-[0.5vw]',
    avatar: 'size-[1.8vw] rounded-[0.45vw] text-[0.7vw]',
    emoji: 'text-[1.05vw]',
    name: 'text-[clamp(12px,0.95vw,19px)]',
    title: 'text-[clamp(10px,0.78vw,16px)] line-clamp-2'
  }
})[props.tier])
</script>

<template>
  <article
    class="flex min-h-0 min-w-0 flex-col overflow-hidden border bg-rv-surface"
    :class="[sizes.card, fresh ? 'animate-rv-card-in border-rv-green' : 'border-rv-border']"
  >
    <div
      class="flex min-w-0"
      :class="sizes.head"
    >
      <div
        class="flex shrink-0 items-center justify-center font-mono-rv font-bold text-rv-bg"
        :class="[sizes.avatar, avatarTone]"
        aria-hidden="true"
      >
        <span
          v-if="participant.emoji"
          :class="sizes.emoji"
        >{{ participant.emoji }}</span>
        <template v-else>
          {{ initials(participant.name) }}
        </template>
      </div>
      <h2
        class="w-full min-w-0 truncate leading-[1.15] font-bold"
        :class="sizes.name"
      >
        {{ participant.name }}
      </h2>
    </div>
    <p
      v-if="titleMissing"
      class="font-mono-rv text-rv-card-muted"
      :class="sizes.title"
    >
      title 404
    </p>
    <p
      v-else
      class="leading-[1.25] text-pretty text-rv-text-2"
      :class="sizes.title"
    >
      {{ participant.title }}
    </p>
  </article>
</template>
