<script setup lang="ts">
import type { Question } from '#shared/utils/questionnaire'

defineProps<{
  index: number
  total: number
  invalid?: boolean
}>()

const emit = defineEmits<{
  moveUp: []
  moveDown: []
  remove: []
  recognize: []
}>()

const question = defineModel<Question>('question', { required: true })

const typeItems = [
  { label: 'Short text', value: 'text' },
  { label: 'A/B choice', value: 'choice' }
]

function setType(type: Question['type']) {
  const q = question.value
  if (type === q.type) {
    return
  }
  q.type = type
  if (type === 'choice') {
    q.options = ['', '']
    delete q.placeholder
    delete q.recognizeMe
  } else {
    delete q.options
  }
}

function setRecognizeMe(value: boolean) {
  if (value) {
    question.value.recognizeMe = true
    emit('recognize')
  } else {
    delete question.value.recognizeMe
  }
}

function setOption(index: number, value: string) {
  if (question.value.options) {
    question.value.options[index] = value
  }
}
</script>

<template>
  <UCard :class="invalid ? 'ring-2 ring-error' : ''">
    <div class="flex flex-col gap-4">
      <!-- Phones: number + actions on the first row, the fields full width below. -->
      <div class="flex flex-wrap items-start gap-3 sm:flex-nowrap">
        <span class="mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {{ index + 1 }}
        </span>

        <div class="order-last flex w-full flex-col gap-3 sm:order-none sm:w-auto sm:flex-1 sm:flex-row">
          <USelect
            :model-value="question.type"
            :items="typeItems"
            class="sm:w-40"
            aria-label="Question type"
            @update:model-value="setType($event as Question['type'])"
          />
          <UInput
            v-model="question.label"
            placeholder="Question"
            class="flex-1"
            aria-label="Question"
          />
        </div>

        <div class="ml-auto flex shrink-0 items-center sm:ml-0">
          <UButton
            icon="i-lucide-arrow-up"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Move up"
            :disabled="index === 0"
            @click="emit('moveUp')"
          />
          <UButton
            icon="i-lucide-arrow-down"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Move down"
            :disabled="index === total - 1"
            @click="emit('moveDown')"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            aria-label="Delete question"
            :disabled="total <= 1"
            @click="emit('remove')"
          />
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:pl-9">
        <template v-if="question.type === 'text'">
          <UInput
            v-model="question.placeholder"
            placeholder="Placeholder (example answer)"
            aria-label="Placeholder"
          />
          <USwitch
            :model-value="!!question.recognizeMe"
            label="Show with match (how to recognize me)"
            @update:model-value="setRecognizeMe"
          />
        </template>

        <template v-else>
          <div class="grid gap-2 sm:grid-cols-2">
            <UInput
              v-for="(option, optionIndex) in question.options ?? []"
              :key="optionIndex"
              :model-value="option"
              :placeholder="optionIndex === 0 ? 'Left option' : 'Right option'"
              :icon="optionIndex === 0 ? 'i-lucide-arrow-left' : 'i-lucide-arrow-right'"
              :aria-label="optionIndex === 0 ? 'Left option' : 'Right option'"
              @update:model-value="setOption(optionIndex, String($event))"
            />
          </div>
        </template>

        <USwitch
          v-model="question.required"
          label="Required"
        />
      </div>
    </div>
  </UCard>
</template>
