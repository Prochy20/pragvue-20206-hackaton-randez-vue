<script setup lang="ts">
interface Token {
  text: string
  tone?: 'key' | 'value' | 'punct'
}

const props = defineProps<{
  value: Record<string, unknown>
}>()

function tokenize(value: unknown, depth: number): Token[] {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value)
    if (!entries.length) {
      return [{ text: '{}', tone: 'punct' }]
    }
    const pad = '  '.repeat(depth + 1)
    const tokens: Token[] = [{ text: '{', tone: 'punct' }]
    entries.forEach(([key, child], i) => {
      tokens.push(
        { text: `\n${pad}` },
        { text: JSON.stringify(key), tone: 'key' },
        { text: ': ', tone: 'punct' },
        ...tokenize(child, depth + 1)
      )
      if (i < entries.length - 1) {
        tokens.push({ text: ',', tone: 'punct' })
      }
    })
    tokens.push({ text: `\n${'  '.repeat(depth)}` }, { text: '}', tone: 'punct' })
    return tokens
  }
  return [{ text: JSON.stringify(value) ?? 'null', tone: 'value' }]
}

const tokens = computed(() => tokenize(props.value, 0))

const toneClass = {
  key: 'text-rv-pink',
  value: 'text-rv-green',
  punct: 'text-rv-muted'
} as const
</script>

<template>
  <div class="overflow-x-auto rounded-2xl bg-rv-code p-4 font-mono-rv text-[12.5px] leading-[1.7] whitespace-pre">
    <code><span
      v-for="(token, i) in tokens"
      :key="i"
      :class="token.tone && toneClass[token.tone]"
    >{{ token.text }}</span></code>
  </div>
</template>
