<script setup lang="ts">
// TYPES
import type { YearSelectorProps } from '~~/components/YearSelector/types/year-selector-props.type'

const props = defineProps<YearSelectorProps>()
const emits = defineEmits<{
  (e: 'year', year: number): void
  (e: 'previous'): void
  (e: 'next'): void
}>()

const yearBtn = ref<any>()
const yearSelectorVisible = ref(false)
const dateObj = computed(() => $date(props.date))

const internalValue = ref($date(props.date).year())

const yearOptions = computed(() => {
  const countOfYearsShown = 5

  return Array.from(Array(countOfYearsShown).keys()).map((_, idx) => {
    return internalValue.value - (Math.floor(countOfYearsShown / 2) - idx)
  })
})

// INCREMENT / DECREMENT
const modifier = ref<-1 | 1>(1)
const { pause, resume } = useIntervalFn(() => handleChange(), 120, {
  immediate: false,
  immediateCallback: true,
})

function handleChange() {
  internalValue.value += modifier.value
}

function startChange(_: PointerEvent, increment = true) {
  modifier.value = increment ? 1 : -1

  window.addEventListener('pointerup', stopChange)
  resume()
}

function stopChange() {
  pause()
  window.removeEventListener('pointerup', stopChange)
}

function sync() {
  return (internalValue.value = $date(props.date).year())
}

function handleYearSelect(year: number) {
  emits('year', year)
  yearSelectorVisible.value = false
}

defineExpose({ sync })
</script>

<template>
  <div class="year-selector">
    <Btn
      display="lt-xm:!none"
      size="auto"
      w="8"
      h="8"
      p="3"
      tabindex="-1"
      icon="majesticons:chevron-left"
      @click="$emit('previous')"
    />
    <Btn
      ref="yearBtn"
      size="sm"
      h="8"
      grow
      tabindex="-1"
      :label="$d(dateObj.valueOf(), 'year')"
    />
    <Btn
      display="lt-xm:!none"
      size="auto"
      w="8"
      h="8"
      p="3"
      tabindex="-1"
      icon="majesticons:chevron-right"
      @click="$emit('next')"
    />

    <Menu
      v-model="yearSelectorVisible"
      :target="yearBtn"
      hide-header
      :fit="false"
      w="60"
      content-class="flex-gap-y-1"
      :reference-target="$bp.xm ? referenceTarget : undefined"
      @hide="sync"
    >
      <Btn
        tabindex="-1"
        size="xs"
        icon="bi:caret-up-fill"
        color="ca"
        name="increment"
        @pointerdown="startChange($event, false)"
        @mousedown.stop.prevent=""
      />

      <Btn
        v-for="year in yearOptions"
        :key="year"
        size="sm"
        tabindex="-1"
        name="year"
        :class="{ 'bg-primary color-white': dateObj.year() === year }"
        @click="handleYearSelect(year)"
        @mousedown.stop.prevent
      >
        {{ year }}
      </Btn>

      <Btn
        tabindex="-1"
        size="xs"
        icon="bi:caret-up-fill rotate-180"
        color="ca"
        name="decrement"
        @pointerdown="startChange($event, true)"
        @mousedown.stop.prevent
      />
    </Menu>
  </div>
</template>

<style lang="scss" scoped>
.year-selector {
  --apply: flex flex-gap-x-1 items-center;
}
</style>
