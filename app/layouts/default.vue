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
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>
  </div>
</template>
