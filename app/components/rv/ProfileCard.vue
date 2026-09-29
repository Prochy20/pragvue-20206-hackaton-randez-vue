<script setup lang="ts">
defineProps<{
  profile: PublicProfile
  token: string
}>()
</script>

<template>
  <article class="animate-rv-card-in rounded-[22px] bg-rv-pink p-1.5">
    <div class="flex flex-col gap-3.5 rounded-[17px] bg-rv-surface p-4.5">
      <div class="flex items-center justify-between font-mono-rv text-[11px] font-semibold">
        <span class="text-rv-pink">{{ profile.event.name.toUpperCase() }} · {{ cardNumber(profile.number) }}</span>
        <span class="text-rv-muted">{{ rarity(token) }}</span>
      </div>

      <div class="relative flex h-30 items-center justify-center rounded-xl bg-rv-pink font-mono-rv text-[54px] font-extrabold tracking-[-2px] text-rv-bg">
        {{ initials(profile.name) }}
        <span
          v-if="profile.emoji"
          class="absolute top-2.5 right-3 font-emoji text-2xl font-normal tracking-normal"
          aria-hidden="true"
        >{{ profile.emoji }}</span>
      </div>

      <div>
        <p class="text-[13px] font-medium text-rv-muted">
          {{ profile.name }}
        </p>
        <h1 class="mt-1 text-[26px] leading-[1.05] font-bold tracking-[-0.5px] text-balance">
          {{ profile.title }}
        </h1>
      </div>

      <p
        v-if="profile.tagline"
        class="text-sm leading-[1.45] text-pretty text-rv-text-2"
      >
        {{ profile.tagline }}
      </p>

      <dl class="grid grid-cols-2 gap-2 font-mono-rv text-[11px] leading-[1.4] font-medium">
        <div class="rounded-lg bg-rv-surface-3 p-2">
          <dt class="text-rv-muted">
            special move
          </dt>
          <dd>{{ profile.specialMove ?? '—' }}</dd>
        </div>
        <div class="rounded-lg bg-rv-surface-3 p-2">
          <dt class="text-rv-muted">
            weakness
          </dt>
          <dd>{{ profile.weakness ?? '—' }}</dd>
        </div>
      </dl>
    </div>
  </article>
</template>
