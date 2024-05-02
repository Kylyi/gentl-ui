<script setup lang="ts">
const { color, toggleDark } = useTheme()
</script>

<template>
  <Toggle
    id="theme-toggle"
    :model-value="color"
    check-value="light"
    uncheck-value="dark"
    size="sm"
    m="!none"
    no-hover-effect
    :visuals="{
      unchecked: {
        bullet: 'bg-transparent',
        icon: 'i-clarity:moon-solid color-light text-sm',
      },
      checked: {
        bullet: 'bg-transparent',
        icon: 'i-akar-icons:sun text-sm',
      },
    }"
    @update:model-value="toggleDark()"
  />
</template>
