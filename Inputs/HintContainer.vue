<script setup lang="ts">
type IProps = {
  hint: string
}

defineProps<IProps>()
</script>

<template>
  <span
    text="caption"
    color="ca"
    p="x-2 t-0.5 b-1"
    font="rem-12"
  >
    {{ hint }}
  </span>
</template>
