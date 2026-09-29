<script setup lang="ts">
const props = defineProps<{
  name: string
  slug: string
  adminUrl: string
}>()

const toast = useToast()
const showBookmark = ref(true)

const origin = useRequestURL().origin

const links = computed(() => [
  { label: 'Registration', icon: 'i-lucide-clipboard-pen', url: `${origin}/e/${props.slug}` },
  { label: 'Live wall', icon: 'i-lucide-presentation', url: `${origin}/e/${props.slug}/wall` },
  { label: 'Admin', icon: 'i-lucide-shield', url: props.adminUrl }
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

    <UAlert
      v-if="showBookmark"
      color="warning"
      variant="subtle"
      icon="i-lucide-bookmark"
      title="Bookmark this page – it's the only way back to your admin."
      :actions="[{ label: 'Copy admin link', icon: 'i-lucide-copy', color: 'warning', variant: 'outline', onClick: () => copy(adminUrl) }]"
      close
      @update:open="showBookmark = $event"
    />

    <div class="grid gap-3 sm:grid-cols-3">
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
