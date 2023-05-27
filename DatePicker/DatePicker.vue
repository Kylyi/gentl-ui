<script setup lang="ts">
import { Dayjs } from 'dayjs'

// TYPES
import type { DayEvent } from '~~/components/DatePicker/types/DayEvent.type'
import type { IDatePickerProps } from '~~/components/DatePicker/types/datepicker-props.type'

// MODELS
import { Day } from '~~/libs/App/data/models/day.model'

const props = withDefaults(defineProps<IDatePickerProps>(), {
  excludedDays: () => [],
})

const emits = defineEmits<{
  (e: 'update:model-value', val: Dayjs): void
}>()

// UTILS
const { getPeriod, getExtendedPeriod, getDaysInPeriod } = useDateUtils()

// LAYOUT
const daysCount = computedEager(() => 7 - props.excludedDays.length)
const daysInPeriod = computed(() =>
  getDaysInPeriod(extendedPeriod, {
    excludedDays: excludedDays.value,
    currentPeriod: period.value,
  })
)
const minCountOfWeeks = 6

function isDayDisabled(day: Day) {
  if (!props.disabledDays && !props.allowedDays) {
    return false
  }

  if (typeof props.disabledDays === 'function') {
    return props.disabledDays(day.dateObj)
  } else if (props.disabledDays) {
    return props.disabledDays.some(d => $date(d).isSame(day.dateObj, 'd'))
  }

  if (typeof props.allowedDays === 'function') {
    return !props.allowedDays(day.dateObj)
  } else if (props.allowedDays) {
    return !props.allowedDays.some(d => $date(d).isSame(day.dateObj, 'd'))
  }
}

const eventsByDay = computed(() => {
  return props.events?.reduce((agg, event) => {
    const day = $date(event.date).startOf('d').format('YYYY-MM-DD')

    if (agg[day] === undefined) {
      agg[day] = []
    }

    agg[day].push(event)

    return agg
  }, {} as Record<string, DayEvent[]>)
})

function handleSelectToday() {
  emits('update:model-value', $date().startOf('d'))
}

// DATA
const model = toRef(props, 'modelValue')
const internalValue = ref<Datetime>(props.modelValue) as Ref<Datetime>
const excludedDays = toRef(props, 'excludedDays')
const period = computed(() =>
  getPeriod({ dateRef: internalValue, unit: 'month' })
)
const extendedPeriod = computed(() =>
  getExtendedPeriod({ dateRef: internalValue, unit: 'month', minCountOfWeeks })
)
const internalValueObj = computed(() => $date(internalValue.value))

const hasValue = computed(() => {
  return !(isNil(model.value) || model.value === '')
})

function handleDaySelect(day: Day) {
  if (isDayDisabled(day)) {
    return
  }

  emits('update:model-value', day.dateObj)
}

defineExpose({
  sync: () => (internalValue.value = model.value),
})
</script>

<template>
  <div class="date-picker">
    <!-- SHORTCUTS -->
    <slot
      v-if="shortcuts || $slots.shortcuts"
      name="shortcuts"
    />

    <div
      flex="~ 1 col"
      overflow="auto"
    >
      <DatePickerNavigation
        :model-value="internalValueObj"
        @update:model-value="internalValue = $event"
      />

      <!-- DAYS -->
      <div
        flex="~"
        p="t-2"
        bg="white dark:darker"
      >
        <div
          v-for="(day, dayIdx) in daysInPeriod.slice(0, daysCount)"
          :key="dayIdx"
          flex="~ center 1"
          capitalize
          font="bold rem-13"
          h="8"
        >
          {{ $d(day.dateValue, 'dayShort') }}
        </div>
      </div>

      <div
        grid="~ cols-7"
        relative
      >
        <DatePickerDay
          v-for="(day, idx) in daysInPeriod"
          :key="idx"
          :day="day"
          :is-selected="hasValue && day.dateObj.isSame(modelValue, 'd')"
          :disabled="isDayDisabled(day)"
          :events="eventsByDay?.[day.dateString]"
          @click="handleDaySelect(day)"
        />

        <DatePickerDaySeparators />
      </div>
    </div>

    <div
      v-if="!noControls"
      class="date-picker-controls"
    >
      <Btn
        size="sm"
        :label="$t('today')"
        @click="handleSelectToday"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.date-picker {
  --apply: flex flex-col bg-filled min-w-80 xm:w-90 overflow-auto;

  &-controls {
    --apply: flex items-center justify-end p-x-2 p-y-1 border-t-1 border-ca;
  }
}
</style>
