<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await clear()
  await navigateTo('/login')
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
