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
    font="rem-12"
  >
    <slot>
      {{ hint }}
    </slot>
  </span>
</template>
