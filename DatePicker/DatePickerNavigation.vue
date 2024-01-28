<script setup lang="ts">
import dayjs from 'dayjs'

// TYPES
import type { IDatePickerNavigationProps } from '~/components/DatePicker/types/datepicker-navigation-props.type'

const props = defineProps<IDatePickerNavigationProps>()

const emits = defineEmits<{
  (e: 'update:model-value', val: dayjs.Dayjs): void
}>()

const navigationEl = ref<HTMLDivElement>()
const date = computed(() => props.modelValue?.valueOf())

function handleNavigation(val: number, unit: 'month' | 'year') {
  emits('update:model-value', props.modelValue.add(val, unit))
}

function handleSetDate(payload: { idx: number }, unit: 'year' | 'month') {
  emits('update:model-value', $date(props.modelValue)[unit](payload.idx) as dayjs.Dayjs)
}
</script>

<template>
  <div
    ref="navigationEl"
    flex="~ xm:gap-x-1 shrink-0"
    items-center
    p="x-2"
    w="full"
    h="12"
    overflow="auto"
  >
    <MonthSelector
      :date="date"
      flex="grow-max"
      :reference-target="navigationEl"
      @previous="handleNavigation(-1, 'month')"
      @next="handleNavigation(1, 'month')"
      @month="handleSetDate($event, 'month')"
    />

    <YearSelector
      :date="date"
      justify-end
      :reference-target="navigationEl"
      @previous="handleNavigation(-1, 'year')"
      @next="handleNavigation(1, 'year')"
      @year="handleSetDate({ idx: $event }, 'year')"
    />
  </div>
</template>
