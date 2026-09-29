<script setup lang="ts">
import type { Questionnaire } from '#shared/utils/questionnaire'
import { MAX_QUESTIONS, questionnaireSchema } from '#shared/utils/questionnaire'

const props = defineProps<{
  slug: string
  questionnaire: Questionnaire
  participantCount: number
}>()

const emit = defineEmits<{
  saved: [questionnaire: Questionnaire]
}>()

const toast = useToast()
const api = useAdminApi(() => props.slug)

const clone = (questionnaire: Questionnaire): Questionnaire => structuredClone(toRaw(questionnaire))

const saved = ref<Questionnaire>(clone(props.questionnaire))
const draft = ref<Questionnaire>(clone(props.questionnaire))
const saving = ref(false)
const invalidIndex = ref<number>()

const dirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(saved.value))

watch(draft, () => {
  invalidIndex.value = undefined
}, { deep: true })

function move(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= draft.value.length) {
    return
  }
  const [question] = draft.value.splice(index, 1)
  if (question) {
    draft.value.splice(target, 0, question)
  }
}

function remove(index: number) {
  draft.value.splice(index, 1)
}

function onRecognize(index: number) {
  draft.value.forEach((question, i) => {
    if (i !== index) {
      delete question.recognizeMe
    }
  })
}

function addQuestion() {
  draft.value.push({ id: crypto.randomUUID(), type: 'text', label: '', required: false })
}

function discard() {
  draft.value = clone(saved.value)
}

async function save() {
  const result = questionnaireSchema.safeParse(draft.value)
  if (!result.success) {
    const issue = result.error.issues[0]
    const index = typeof issue?.path[0] === 'number' ? issue.path[0] : undefined
    toast.add({
      title: 'Can\'t save yet',
      description: index !== undefined ? `Question ${index + 1}: ${issue?.message}` : issue?.message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
    invalidIndex.value = index
    return
  }

  saving.value = true
  try {
    const { questionnaire } = await api.saveQuestionnaire(result.data)
    saved.value = clone(questionnaire)
    draft.value = clone(questionnaire)
    emit('saved', clone(questionnaire))
    toast.add({ title: 'Questionnaire saved', color: 'success', icon: 'i-lucide-check' })
  } catch (error) {
    toast.add({
      title: 'Couldn\'t save the questionnaire',
      description: apiErrorMessage(error),
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    saving.value = false
  }
}

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value) {
    event.preventDefault()
  }
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

onBeforeRouteLeave(() => {
  // Native confirm is the accepted exception here (leave guard only).
  if (dirty.value && !window.confirm('You have unsaved changes to the questionnaire. Leave anyway?')) {
    return false
  }
})
</script>

<template>
  <div class="space-y-4">
    <UAlert
      v-if="participantCount > 0"
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      :title="`${participantCount} ${participantCount === 1 ? 'person' : 'people'} already registered – their answers keep the old wording.`"
    />

    <AdminQuestionCard
      v-for="(question, index) in draft"
      :key="question.id"
      :question="question"
      :index="index"
      :total="draft.length"
      :invalid="invalidIndex === index"
      @move-up="move(index, -1)"
      @move-down="move(index, 1)"
      @remove="remove(index)"
      @recognize="onRecognize(index)"
    />

    <UButton
      v-if="draft.length < MAX_QUESTIONS"
      label="Add question"
      icon="i-lucide-plus"
      color="neutral"
      variant="outline"
      block
      @click="addQuestion"
    />

    <div class="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-default bg-default/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
      <span
        v-if="dirty"
        class="mr-auto text-sm text-muted"
      >Unsaved changes</span>
      <UButton
        label="Discard changes"
        color="neutral"
        variant="ghost"
        :disabled="!dirty || saving"
        @click="discard"
      />
      <UButton
        label="Save questionnaire"
        icon="i-lucide-save"
        :disabled="!dirty"
        :loading="saving"
        @click="save"
      />
    </div>
  </div>
</template>
