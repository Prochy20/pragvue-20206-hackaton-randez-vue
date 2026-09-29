<script setup lang="ts" generic="T extends string">
defineProps<{
  options: readonly T[]
  label?: string
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div
    class="flex rounded-[10px] bg-rv-surface-2 p-1 font-mono-rv text-xs font-semibold"
    role="group"
    :aria-label="label"
  >
    <button
      v-for="option in options"
      :key="option"
      type="button"
      :aria-pressed="model === option"
      class="flex-1 rounded-[7px] p-2 text-center transition focus-visible:outline-2 focus-visible:outline-rv-green active:scale-[.98]"
      :class="model === option ? 'bg-rv-text text-rv-bg' : 'text-rv-muted hover:text-rv-text-2'"
      @click="model = option"
    >
      {{ option }}
    </button>
  </div>
</template>
