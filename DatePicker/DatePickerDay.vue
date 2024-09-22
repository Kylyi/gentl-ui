<script setup lang="ts">
// TYPES
import type { DayEvent } from '~/components/DatePicker/types/DayEvent.type'
import type { IDatePickerDayProps } from '~/components/DatePicker/types/datepicker-day-props.type'

const props = withDefaults(defineProps<IDatePickerDayProps>(), {
  edge: true,
})

// Utils
const { formatDate } = useDateUtils()

// Layout
const day = toRef(props, 'day')

const classes = computed(() => {
  return {
    'is-today': day.value.isToday,
    'is-current': !day.value.isNotCurrent,
    'is-holiday': day.value.isHoliday,
    'is-weekend': day.value.isWeekend,
    'is-not-current': day.value.isNotCurrent,
    'is-selected': props.isSelected,
    'is-disabled': props.disabled,
  }
})

const eventsAdjusted = computed<Pick<DayEvent, 'color' | 'icon'>[]>(() => {
  if (!props.events) {
    return []
  }

  return props.events.map(e => {
    return typeof e === 'string' ? { color: e } : e
  })
})
</script>

<template>
  <div
    class="dp-day"
    :class="classes"
  >
    <!-- Edge -->
    <div
      v-if="edge && (day.isEdge.start.month || day.isEdge.end.month)"
      class="edge"
    >
      {{ formatDate(day.dateValue, 'monthShort') }}
    </div>

    <!-- Top -->
    <div flex="~">
      <div class="dayNo">
        {{ day.dayOfMonth }}
      </div>
    </div>

    <!-- Events -->
    <div
      v-if="eventsAdjusted.length"
      flex="~ 1 wrap gap-1 center"
      p="x-2"
      overflow="auto"
    >
      <div
        v-for="(event, idx) in eventsAdjusted"
        :key="idx"
        w="3"
        h="3"
        :class="[event.color, event.icon || 'i-ic:round-lens']"
        hover="scale-150"
        transition="transform-300"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dp-day {
  @apply flex flex-col cursor-pointer aspect-square font-thin relative;

  &:not(.is-disabled):hover {
    @apply shadow-consistent dark:shadow-true-gray-700/50 shadow-true-gray-300/50;
  }

  .dayNo {
    @apply flex flex-center w-7 h-7 relative m-1 rounded-full;
  }

  .edge {
    @apply absolute top-.5 right-.5 whitespace-nowrap italic text-sm color-gray leading-none;
  }

  &.is-weekend {
    @apply bg-true-gray-800/3 dark:bg-true-gray-200/3;
  }

  &.is-not-current {
    @apply bg-true-gray-800/7 dark:bg-true-gray-200/7;
  }

  &.is-today .dayNo {
    @apply rounded-full border-1 dark:border-white border-ca;
  }

  &.is-selected .dayNo {
    @apply dark:bg-primary color-white bg-primary;
  }

  &.is-disabled {
    @apply color-true-gray-400 dark:color-true-gray-600 cursor-not-allowed;
  }
}
</style>
