<script setup lang="ts">
const props = defineProps<{
  phase: 'matching' | 'merged'
  roundNumber: number | null
  groupCount: number
  participantCount: number
}>()

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

const people = computed(() => `${props.participantCount} ${props.participantCount === 1 ? 'person' : 'people'}`)
</script>

<template>
  <Transition
    appear
    enter-active-class="transition-opacity duration-500"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-500"
    leave-to-class="opacity-0"
  >
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-rv-bg/97 px-[6vw]"
      role="status"
      aria-live="polite"
    >
      <div
        :key="phase"
        class="flex w-full max-w-[min(90vw,1400px)] flex-col gap-[clamp(14px,1.6vw,32px)] font-mono-rv"
      >
        <template v-if="phase === 'matching'">
          <p class="flex items-center gap-[0.4em] text-[clamp(32px,4.2vw,88px)] leading-none font-bold">
            <span><span class="text-rv-pink">$</span> npm install friends…</span>
            <span
              class="inline-block h-[0.9em] w-[0.5em] animate-rv-blink bg-rv-green"
              aria-hidden="true"
            />
          </p>
          <p
            class="animate-rv-fade-in text-[clamp(18px,1.9vw,40px)] text-rv-text-2 [animation-delay:400ms]"
          >
            pairing {{ people }}
          </p>
          <div
            class="
              relative h-[clamp(8px,0.7vw,14px)] w-full max-w-[min(70vw,900px)] animate-rv-fade-in
              overflow-hidden rounded-full bg-rv-track [animation-delay:700ms]
            "
            aria-hidden="true"
          >
            <span class="absolute inset-y-0 w-1/3 animate-[rv-indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-rv-green" />
          </div>
          <p
            class="animate-rv-fade-in text-[clamp(14px,1.2vw,26px)] text-rv-muted [animation-delay:1000ms]"
          >
            resolving shared dependencies · writing icebreakers
          </p>
        </template>

        <template v-else>
          <p class="text-[clamp(32px,4.2vw,88px)] leading-none font-bold">
            <span class="text-rv-pink">$</span> git merge round-{{ roundNumber ?? '?' }}
          </p>
          <p
            class="animate-rv-fade-in text-[clamp(16px,1.6vw,34px)] text-rv-muted [animation-delay:500ms]"
          >
            Merge made by the 'icebreaker' strategy.
          </p>
          <p
            class="animate-rv-fade-in text-[clamp(24px,2.8vw,60px)] font-bold text-rv-green [animation-delay:1100ms]"
          >
            ✓ {{ plural(groupCount, 'group') }} paired, 0 small talks
          </p>
          <p
            class="animate-rv-fade-in text-[clamp(16px,1.6vw,34px)] text-rv-text-2 [animation-delay:1600ms]"
          >
            {{ people }} · go find your friends
          </p>
        </template>
      </div>
    </div>
  </Transition>
</template>

<style>
/* Global on purpose: the keyframes are referenced from a Tailwind arbitrary class. */
@keyframes rv-indeterminate {
  from {
    left: -33%;
  }
  to {
    left: 100%;
  }
}
</style>
