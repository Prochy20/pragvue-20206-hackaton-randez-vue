<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'ghost' | 'outline'
  to?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  size?: 'md' | 'lg'
}>(), {
  variant: 'primary',
  to: undefined,
  type: 'button',
  size: 'md'
})

const classes = computed(() => [
  'flex w-full items-center justify-center gap-2.5 rounded-[14px] px-4 font-mono-rv font-bold transition',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rv-green',
  'enabled:active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50',
  props.size === 'lg' ? 'h-15 text-[19px] font-extrabold' : 'h-14 text-base',
  props.variant === 'primary' && 'bg-rv-green text-rv-bg',
  props.variant === 'ghost' && 'border border-rv-border-2 text-rv-text',
  props.variant === 'outline' && 'border border-rv-green text-rv-green'
])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="classes"
    class="active:scale-[.98]"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    :class="classes"
  >
    <slot />
  </button>
</template>
