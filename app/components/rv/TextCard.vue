<script setup lang="ts">
const props = defineProps<{
  question: Question
  number: number
}>()

const answer = defineModel<string>({ default: '' })

const id = computed(() => `rv-q-${props.question.id}`)
</script>

<template>
  <div class="mt-3 flex animate-rv-card-in flex-col gap-4 rounded-[22px] bg-rv-text p-6 text-rv-bg">
    <p class="font-mono-rv text-xs font-medium text-rv-card-muted">
      // question {{ String(number).padStart(2, '0') }} · free text
    </p>
    <label
      :for="id"
      class="text-[30px] leading-[1.05] font-bold tracking-[-1px] text-balance"
    >
      {{ question.label }}
    </label>
    <p class="text-sm text-rv-card-muted">
      {{ question.required ? 'Required. We\'ll only use it for good.' : 'We\'ll only use it for good. Mostly.' }}
    </p>
    <textarea
      :id="id"
      v-model="answer"
      :maxlength="ANSWER_MAX"
      :placeholder="question.placeholder"
      rows="4"
      class="min-h-32.5 resize-none rounded-xl bg-rv-card-light-2 p-3.5 font-mono-rv text-[15px] leading-normal font-medium outline-none placeholder:text-rv-card-muted/70 focus:ring-2 focus:ring-rv-green"
    />
    <p class="text-right font-mono-rv text-[11px] text-rv-card-muted">
      {{ answer.length }} / {{ ANSWER_MAX }}
    </p>
  </div>
</template>
