<script setup lang="ts">
const props = defineProps<{
  question: Question
  number: number
  // Cards left after this one; drives the ghost stack behind it.
  remaining: number
}>()

const emit = defineEmits<{
  answer: [value: string | null]
}>()

const SWIPE_THRESHOLD = 90
const FLY_MS = 200

const left = computed(() => props.question.options?.[0] ?? '')
const right = computed(() => props.question.options?.[1] ?? '')

// Options go up to 60 chars and labels up to 200, so shrink the type instead of truncating.
const optionSize = computed(() => {
  const longest = Math.max(left.value.length, right.value.length)
  return longest <= 9 ? 'text-xl' : longest <= 18 ? 'text-base' : 'text-sm'
})
const labelSize = computed(() => {
  const length = props.question.label.length
  return length <= 40 ? 'text-4xl' : length <= 90 ? 'text-3xl' : 'text-2xl'
})

const dragX = ref(0)
const dragging = ref(false)
const flying = ref<'left' | 'right' | 'up' | null>(null)
let startX = 0

const stamp = computed(() => {
  if (Math.abs(dragX.value) < 8) {
    return null
  }
  return dragX.value < 0 ? left.value : right.value
})
const stampOpacity = computed(() => Math.min(Math.abs(dragX.value) / SWIPE_THRESHOLD, 1))

const cardStyle = computed(() => {
  if (flying.value) {
    const x = flying.value === 'left' ? -480 : flying.value === 'right' ? 480 : 0
    const y = flying.value === 'up' ? -600 : 0
    return {
      transform: `translate(${x}px, ${y}px) rotate(${x / 16}deg)`,
      transition: `transform ${FLY_MS}ms ease-out`
    }
  }
  return {
    transform: `translateX(${dragX.value}px) rotate(${dragX.value / 4.5 * 1}deg)`,
    transition: dragging.value ? 'none' : 'transform 200ms ease-out'
  }
})

function pick(direction: 'left' | 'right' | 'up') {
  if (flying.value || (direction === 'up' && props.question.required)) {
    return
  }
  flying.value = direction
  const value = direction === 'left' ? left.value : direction === 'right' ? right.value : null
  setTimeout(() => emit('answer', value), FLY_MS)
}

function onPointerDown(e: PointerEvent) {
  if (flying.value || (e.target as HTMLElement).closest('button')) {
    return
  }
  dragging.value = true
  startX = e.clientX
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (dragging.value) {
    dragX.value = e.clientX - startX
  }
}

function onPointerUp() {
  if (!dragging.value) {
    return
  }
  dragging.value = false
  if (Math.abs(dragX.value) >= SWIPE_THRESHOLD) {
    pick(dragX.value < 0 ? 'left' : 'right')
  } else {
    dragX.value = 0
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    pick('left')
  } else if (e.key === 'ArrowRight') {
    pick('right')
  } else if (e.key === 'ArrowUp') {
    pick('up')
  } else {
    return
  }
  e.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="relative mt-5 flex-none">
    <div
      v-if="remaining > 1"
      class="absolute inset-x-4.5 top-6 h-100 rotate-3 rounded-[22px] bg-rv-ghost-1"
    />
    <div
      v-if="remaining > 0"
      class="absolute inset-x-2 top-3 h-102.5 -rotate-2 rounded-[22px] bg-rv-ghost-2"
    />

    <div
      class="relative flex min-h-105 animate-rv-card-in cursor-grab touch-none flex-col rounded-[22px] bg-rv-text p-6 text-rv-bg shadow-[0_12px_30px_rgba(0,0,0,.4)] will-change-transform select-none active:cursor-grabbing"
      :style="cardStyle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <p class="font-mono-rv text-xs font-medium text-rv-card-muted">
        // question {{ String(number).padStart(2, '0') }}
      </p>
      <h2
        class="mt-3.5 leading-none font-bold tracking-[-1px] text-balance"
        :class="labelSize"
      >
        {{ question.label }}
      </h2>

      <div class="mt-auto grid grid-cols-2 gap-2.5 pt-6">
        <button
          type="button"
          class="flex min-h-24 flex-col justify-between gap-3 rounded-[14px] bg-rv-pink p-3 text-left font-mono-rv transition active:scale-[.98]"
          @click="pick('left')"
        >
          <span class="text-xs font-bold">← swipe</span>
          <span
            class="leading-tight font-bold wrap-break-word hyphens-auto"
            :class="optionSize"
          >{{ left }}</span>
        </button>
        <button
          type="button"
          class="flex min-h-24 flex-col items-end justify-between gap-3 rounded-[14px] bg-rv-card-light-3 p-3 text-right font-mono-rv transition active:scale-[.98]"
          @click="pick('right')"
        >
          <span class="text-xs font-bold">swipe →</span>
          <span
            class="max-w-full leading-tight font-bold wrap-break-word hyphens-auto"
            :class="optionSize"
          >{{ right }}</span>
        </button>
      </div>

      <div
        v-if="stamp"
        class="pointer-events-none absolute top-36 rounded-lg border-3 px-2.5 py-1 font-mono-rv text-xl font-extrabold uppercase"
        :class="dragX < 0 ? 'left-4 -rotate-12 border-rv-pink text-rv-pink' : 'right-4 rotate-12 border-rv-green text-rv-green'"
        :style="{ opacity: stampOpacity }"
      >
        {{ stamp }}
      </div>
    </div>
  </div>

  <p class="flex justify-center gap-4 font-mono-rv text-xs font-medium text-rv-muted">
    <template v-if="question.required">
      <span>← / → pick one</span><span>·</span><span>this one's required</span>
    </template>
    <template v-else>
      <button
        type="button"
        class="underline-offset-4 hover:underline"
        @click="pick('up')"
      >
        ↑ skip
      </button>
      <span>·</span><span>both are fine (liar)</span>
    </template>
  </p>
</template>
