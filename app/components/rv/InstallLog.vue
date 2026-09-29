<script setup lang="ts">
export interface LogLine {
  text: string
  // warn = yellow "WARN" prefix, ok = green " ok" suffix, strong = bright final line
  tone?: 'warn' | 'ok' | 'strong'
}

const props = defineProps<{
  prompt: string
  lines: LogLine[]
  footer: string
  // Fills the progress bar; until then it creeps towards ~90 %.
  done?: boolean
}>()

const SEGMENTS = 20
const LINE_MS = 400

const visible = ref(0)
const filled = ref(0)
let lineTimer: ReturnType<typeof setInterval> | undefined
let barTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  lineTimer = setInterval(() => {
    visible.value = Math.min(visible.value + 1, props.lines.length)
  }, LINE_MS)
  barTimer = setInterval(() => {
    filled.value = Math.min(filled.value + 1, SEGMENTS - 2)
  }, 250)
})

onBeforeUnmount(() => {
  clearInterval(lineTimer)
  clearInterval(barTimer)
})

watch(() => props.done, (done) => {
  if (done) {
    visible.value = props.lines.length
    filled.value = SEGMENTS
  }
})
</script>

<template>
  <RvPrompt>{{ prompt }}</RvPrompt>

  <h1 class="mt-24 text-[32px] leading-[1.05] font-bold tracking-[-1px]">
    <slot />
  </h1>

  <div
    class="rounded-2xl border border-rv-border p-4 font-mono-rv text-xs leading-[1.8] text-rv-text-2"
    role="status"
    aria-live="polite"
  >
    <p
      v-for="(line, i) in lines.slice(0, visible)"
      :key="i"
      class="animate-rv-fade-in"
      :class="line.tone === 'strong' && 'mt-1.5 text-rv-text'"
    >
      <span
        v-if="line.tone === 'warn'"
        class="text-rv-yellow"
      >WARN </span>{{ line.text }}<span
        v-if="line.tone === 'ok'"
        class="text-rv-green"
      > ok</span>
    </p>
    <div class="mt-2 flex h-2.5 gap-0.5">
      <span
        v-for="i in SEGMENTS"
        :key="i"
        class="flex-1 rounded-[1px] transition-colors"
        :class="i <= filled ? 'bg-rv-green' : 'bg-rv-track'"
      />
    </div>
  </div>

  <p class="mt-auto text-center font-mono-rv text-xs text-rv-muted">
    {{ footer }}
  </p>
</template>
