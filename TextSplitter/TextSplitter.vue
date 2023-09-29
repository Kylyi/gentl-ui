<script setup lang="ts">
// TYPES
import type { ITextSplitterProps } from '~/components/TextSplitter/types/text-splitter-props.type'

defineProps<ITextSplitterProps>()
</script>

<template>
  <div flex="~ gap-x-1">
    <template
      v-for="(part, idx) in modelValue"
      :key="idx"
    >
      <span>
        {{ part }}
      </span>

      <span v-if="idx !== modelValue.length - 1">&#x2022;</span>
    </template>
  </div>
</template>
