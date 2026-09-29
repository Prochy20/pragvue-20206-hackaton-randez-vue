<script setup lang="ts">
export interface StepOneState {
  name: string
  role: string
  company: string
  hereFor: HereFor[]
}

const state = defineModel<StepOneState>({ required: true })

const emit = defineEmits<{
  next: []
}>()

const errors = ref<Partial<Record<'name' | 'role', string>>>({})

function toggle(option: HereFor) {
  const list = state.value.hereFor
  state.value.hereFor = list.includes(option) ? list.filter(o => o !== option) : [...list, option]
}

function next() {
  errors.value = {
    name: state.value.name.trim() ? undefined : 'npm ERR! name is required',
    role: state.value.role.trim() ? undefined : 'npm ERR! role is required'
  }
  if (!errors.value.name && !errors.value.role) {
    emit('next')
  }
}

const fields = [
  { key: 'name', label: 'name', placeholder: 'Jana Nováková', autocomplete: 'name' },
  { key: 'role', label: 'role', placeholder: 'Frontend developer', autocomplete: 'organization-title' },
  { key: 'company', label: 'company', optional: true, placeholder: 'where you push to prod', autocomplete: 'organization' }
] as const
</script>

<template>
  <form
    class="flex flex-1 flex-col gap-4.5"
    novalidate
    @submit.prevent="next"
  >
    <RvPrompt>$ rendez-vue init <span class="text-rv-green">step 1/2</span></RvPrompt>

    <h1 class="text-[30px] leading-[1.05] font-bold tracking-[-1px]">
      The boring part.<br><span class="text-rv-muted">Quick, promise.</span>
    </h1>

    <div
      v-for="field in fields"
      :key="field.key"
      class="flex flex-col gap-1.5"
    >
      <label
        :for="`rv-${field.key}`"
        class="font-mono-rv text-xs font-medium text-rv-muted"
      >
        {{ field.label }} <span
          v-if="'optional' in field"
          class="opacity-70"
        >--optional</span>
      </label>
      <input
        :id="`rv-${field.key}`"
        v-model="state[field.key]"
        type="text"
        :maxlength="NAME_MAX"
        :placeholder="field.placeholder"
        :autocomplete="field.autocomplete"
        class="h-12.5 rounded-xl border border-rv-border bg-rv-surface-2 px-3.5 text-base outline-none placeholder:text-rv-muted/70 focus:border-rv-green"
      >
      <p
        v-if="field.key !== 'company' && errors[field.key]"
        class="font-mono-rv text-xs text-rv-pink"
      >
        {{ errors[field.key] }}
      </p>
    </div>

    <fieldset class="flex flex-col gap-2">
      <legend class="mb-2 font-mono-rv text-xs font-medium text-rv-muted">
        here for
      </legend>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in HERE_FOR_OPTIONS"
          :key="option"
          type="button"
          :aria-pressed="state.hereFor.includes(option)"
          class="rounded-full px-3.5 py-2.25 text-sm transition active:scale-[.98]"
          :class="state.hereFor.includes(option)
            ? 'bg-rv-green font-semibold text-rv-bg'
            : 'border border-rv-border-2 font-medium'"
          @click="toggle(option)"
        >
          {{ option }}
        </button>
      </div>
    </fieldset>

    <div class="mt-auto pt-2">
      <RvButton type="submit">
        next: the weird part →
      </RvButton>
    </div>
  </form>
</template>
