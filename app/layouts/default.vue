<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
const toast = useToast()
const loggingOut = ref(false)

async function logout() {
  loggingOut.value = true
  try {
    await clear()
    await navigateTo('/login')
  } catch {
    toast.add({ title: 'Could not log out', description: 'Check your connection and try again.', color: 'error' })
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div>
    <UHeader to="/">
      <template #title>
        <span class="font-grotesk text-lg font-bold tracking-tight">
          Rendez-<span class="text-primary">Vue</span>
        </span>
      </template>

      <template #right>
        <template v-if="loggedIn">
          <span class="hidden text-sm text-muted sm:inline">{{ user?.email }}</span>
          <UButton
            label="Log out"
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            :loading="loggingOut"
            @click="logout"
          />
        </template>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>
  </div>
</template>
