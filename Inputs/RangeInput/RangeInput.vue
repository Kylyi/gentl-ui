<script setup lang="ts">
type IProps = {
  modelValue?: number
}

defineProps<IProps>()
defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

// Layout
const model = defineModel<number>()
</script>

<template>
  <input
    v-model.number="model"
    type="range"
  >
</template>
