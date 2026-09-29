<script setup lang="ts">
const props = defineProps<{
  name: string
  slug: string
}>()

const toast = useToast()

const origin = useRequestURL().origin

const links = computed(() => [
  { label: 'Registration', icon: 'i-lucide-clipboard-pen', url: `${origin}/e/${props.slug}` },
  { label: 'Live wall', icon: 'i-lucide-presentation', url: `${origin}/e/${props.slug}/wall` }
])

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: 'Copied', icon: 'i-lucide-check', color: 'success' })
  } catch {
    toast.add({ title: 'Couldn\'t copy – select the link manually', color: 'error' })
  }
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <p class="text-sm font-medium text-primary">
        Event admin
      </p>
      <h1 class="mt-1 text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
        {{ name }}
      </h1>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <UCard
        v-for="link in links"
        :key="link.label"
        :ui="{ body: 'p-3 sm:p-4' }"
      >
        <div class="flex items-center gap-3">
          <UIcon
            :name="link.icon"
            class="size-5 shrink-0 text-primary"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-highlighted">
              {{ link.label }}
            </p>
            <a
              :href="link.url"
              target="_blank"
              class="block truncate text-xs text-muted hover:text-default"
            >{{ link.url }}</a>
          </div>
          <UButton
            icon="i-lucide-copy"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="`Copy ${link.label} link`"
            @click="copy(link.url)"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
