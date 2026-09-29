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
        <span class="flex items-center gap-2">
          <UIcon
            name="i-lucide-snowflake"
            class="size-5 text-primary"
          />
          Icebreaker
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
