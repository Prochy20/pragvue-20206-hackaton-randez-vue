<script setup lang="ts">
const { loggedIn, fetch: refreshSession } = useUserSession()
// Recheck before bouncing: the client state can be stale after a logout in another tab.
if (loggedIn.value && import.meta.client) {
  await refreshSession()
}
if (loggedIn.value) {
  await navigateTo('/')
}
</script>

<template>
  <AuthPanel mode="signup" />
</template>
