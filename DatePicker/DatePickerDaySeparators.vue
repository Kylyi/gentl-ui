<script setup lang="ts">
// Types
import type { IDatePickerDaySeparatorsProps } from '~/components/DatePicker/types/datepicker-day-separators-props.type'

withDefaults(defineProps<IDatePickerDaySeparatorsProps>(), {
  weekCount: 6,
  daysCount: 7,
})
</script>

<template>
  <!-- Horizontal separators -->
  <div
    v-for="w in weekCount - 1"
    :key="w"
    pointer-events="none"
    w="full"
    absolute
    left="0"
    z="1"
    border="b-1 ca dashed"
    :style="{ top: `calc(${(100 / weekCount) * w}% - 0.5px)` }"
  />

  <!-- Vertical separators -->
  <div
    v-for="d in daysCount - 1"
    :key="d"
    pointer-events="none"
    h="full"
    absolute
    top="0"
    z="1"
    border="r-1 ca dashed"
    :style="{ left: `calc(${(100 / daysCount) * d}% - 0.5px)` }"
  />
</template>
