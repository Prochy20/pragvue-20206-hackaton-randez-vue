<script setup lang="ts">
const props = defineProps<{
  questions: Questionnaire
  // Shown above the final CTA after a failed submit.
  error?: string
}>()

const answers = defineModel<Record<string, string>>({ required: true })

const emit = defineEmits<{
  back: []
  submit: []
}>()

// Owned by the page so a failed submit returns to the same card.
const index = defineModel<number>('index', { default: 0 })
const total = computed(() => props.questions.length)
const question = computed(() => props.questions[index.value])
const finished = computed(() => index.value >= total.value)
const isLast = computed(() => index.value === total.value - 1)

const progress = computed(() => `${Math.min(index.value + 1, total.value) / total.value * 100}%`)
const counter = computed(() => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.min(index.value + 1, total.value))} / ${pad(total.value)}`
})

const textAnswer = computed({
  get: () => (question.value && answers.value[question.value.id]) ?? '',
  set: (value: string) => {
    if (question.value) {
      answers.value = { ...answers.value, [question.value.id]: value }
    }
  }
})
const textMissing = computed(() => !!question.value?.required && !textAnswer.value.trim())

function onChoice(value: string | null) {
  const current = question.value
  if (!current) {
    return
  }
  const { [current.id]: _, ...rest } = answers.value
  answers.value = value === null ? rest : { ...rest, [current.id]: value }
  index.value++
}

function next() {
  if (textMissing.value) {
    return
  }
  if (isLast.value) {
    emit('submit')
  } else {
    index.value++
  }
}

function back() {
  if (index.value === 0) {
    emit('back')
  } else {
    index.value = Math.min(index.value, total.value) - 1
  }
}
</script>

<template>
  <div class="flex items-center justify-between font-mono-rv text-xs font-medium text-rv-muted">
    <button
      type="button"
      class="hover:text-rv-text"
      @click="back"
    >
      ← step 2/2
    </button>
    <span>{{ counter }}</span>
  </div>
  <div class="h-1 rounded-sm bg-rv-track">
    <div
      class="h-full rounded-sm bg-rv-green transition-[width] duration-300"
      :style="{ width: progress }"
    />
  </div>

  <template v-if="finished">
    <div class="mt-3 flex animate-rv-card-in flex-col gap-4 rounded-[22px] bg-rv-text p-6 text-rv-bg">
      <p class="font-mono-rv text-xs font-medium text-rv-card-muted">
        // all questions answered
      </p>
      <h2 class="text-[30px] leading-[1.05] font-bold tracking-[-1px]">
        That's the weird part done.
      </h2>
      <p class="text-sm text-rv-card-muted">
        One command left.
      </p>
    </div>
  </template>

  <RvSwipeCard
    v-else-if="question?.type === 'choice'"
    :key="question.id"
    :question="question"
    :number="index + 1"
    :remaining="total - index - 1"
    @answer="onChoice"
  />

  <RvTextCard
    v-else-if="question"
    :key="question.id"
    v-model="textAnswer"
    :question="question"
    :number="index + 1"
  />

  <div
    v-if="finished || question?.type === 'text'"
    class="mt-auto flex flex-col gap-2.5 pt-2"
  >
    <p
      v-if="error && (finished || isLast)"
      class="font-mono-rv text-xs text-rv-pink"
      role="alert"
    >
      npm ERR! {{ error }}
    </p>
    <template v-if="finished || isLast">
      <RvButton
        size="lg"
        :disabled="textMissing"
        @click="finished ? emit('submit') : next()"
      >
        <span class="opacity-55">$</span>npm i friends
      </RvButton>
      <p class="text-center font-mono-rv text-xs text-rv-muted">
        generates your title · finds your match
      </p>
    </template>
    <RvButton
      v-else
      :disabled="textMissing"
      @click="next"
    >
      {{ textAnswer.trim() ? 'next →' : question?.required ? 'answer to continue' : 'skip →' }}
    </RvButton>
  </div>
</template>
