<script setup lang="ts">
import type dayjs from 'dayjs'

// Types
import type { IDatePickerNavigationProps } from '~/components/DatePicker/types/datepicker-navigation-props.type'

const props = defineProps<IDatePickerNavigationProps>()

const emits = defineEmits<{
  (e: 'update:modelValue', val: dayjs.Dayjs): void
}>()

const navigationEl = ref<HTMLDivElement>()
const date = computed(() => props.modelValue?.valueOf())

function handleNavigation(val: number, unit: 'month' | 'year') {
  emits('update:modelValue', props.modelValue.add(val, unit))
}

function handleSetDate(payload: { idx: number }, unit: 'year' | 'month') {
  emits(
    'update:modelValue',
    $date(props.modelValue)[unit](payload.idx) as dayjs.Dayjs,
  )
}
</script>

<template>
  <div
    ref="navigationEl"
    flex="~ xm:gap-x-1 shrink-0 items-center"
    p="x-2"
    w="full"
    h="12"
    overflow="auto"
  >
    <MonthSelector
      :model-value="date"
      flex="grow-max"
      :reference-target="navigationEl"
      @previous="handleNavigation(-1, 'month')"
      @next="handleNavigation(1, 'month')"
      @month="handleSetDate($event, 'month')"
    />

    <YearSelector
      :model-value="date"
      justify-end
      :reference-target="navigationEl"
      @previous="handleNavigation(-1, 'year')"
      @next="handleNavigation(1, 'year')"
      @year="handleSetDate({ idx: $event }, 'year')"
    />
  </div>
</template>
