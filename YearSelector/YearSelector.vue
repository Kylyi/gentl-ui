<script setup lang="ts">
// Types
import type { IYearSelectorProps } from '~/components/YearSelector/types/year-selector-props.type'

// Components
import NumberInput from '~/components/Inputs/NumberInput/NumberInput.vue'

const props = defineProps<IYearSelectorProps>()
const emits = defineEmits<{
  (e: 'year', year: number): void
  (e: 'previous'): void
  (e: 'next'): void
}>()

// Utils
const { $bp } = useNuxtApp()

// Layout
const yearInputEl = ref<InstanceType<typeof NumberInput>>()
const yearSelectorVisible = ref(false)
const isRangeChanged = refAutoReset(false, 300)

/**
 * Internal value is used to navigate through years without changing the actual `model`
 */
const internalValue = ref($date(props.modelValue).year())

const dateObj = computed(() => $date(props.modelValue))

const yearOptions = computed(() => {
  const countOfYearsShown = 5

  return Array.from(Array(countOfYearsShown).keys()).map((_, idx) => {
    return internalValue.value - (Math.floor(countOfYearsShown / 2) - idx)
  })
})

// Increment / Decrement
const modifier = ref<-1 | 1>(1)
const { pause, resume } = useIntervalFn(() => handleRangeChange(), 120, {
  immediate: false,
  immediateCallback: true,
})

function handleManualYearInputChange(year?: number | null | undefined) {
  if (isRangeChanged.value) {
    return
  }

  if (typeof year === 'number' && String(year).length === 4) {
    handleYearSelect(year)
  }
}

function handleRangeChange() {
  isRangeChanged.value = true
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
  return (internalValue.value = $date(props.modelValue).year())
}

function handleYearSelect(year: number) {
  emits('year', year)
  yearSelectorVisible.value = false
}

function handleMouseWheel(ev: WheelEvent) {
  isRangeChanged.value = true

  if (ev.deltaY > 0) {
    internalValue.value++
  } else {
    internalValue.value--
  }

  ev.stopPropagation()
}

watch(
  () => props.modelValue,
  model => (internalValue.value = $date(model).year()),
)

defineExpose({ sync })
</script>

<template>
  <div class="year-selector">
    <!-- Previous btn -->
    <Btn
      size="auto"
      class="year-select__previous"
      tabindex="-1"
      icon="i-majesticons:chevron-left"
      @click="$emit('previous')"
    />

    <!-- Year input -->
    <NumberInput
      ref="yearInputEl"
      :model-value="internalValue"
      no-grouping
      :step="null"
      size="sm"
      w="15"
      grow
      input-class="text-center"
      @update:model-value="handleManualYearInputChange"
    />

    <!-- Next btn -->
    <Btn
      size="auto"
      class="year-select__next"
      tabindex="-1"
      icon="i-majesticons:chevron-right"
      @click="$emit('next')"
    />

    <Menu
      v-model="yearSelectorVisible"
      :target="yearInputEl"
      :fit="false"
      w="60"
      :reference-target="$bp.isGreaterOrEqual('xm') ? referenceTarget : undefined"
      no-uplift
      @before-hide="sync"
      @wheel.passive="handleMouseWheel"
    >
      <Btn
        tabindex="-1"
        size="xs"
        icon="i-bi:caret-up-fill"
        color="ca"
        name="increment"
        :ripple="false"
        @pointerdown="startChange($event, false)"
        @mousedown.stop.prevent
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
        icon="i-bi:caret-up-fill rotate-180"
        color="ca"
        name="decrement"
        :ripple="false"
        @pointerdown="startChange($event, true)"
        @mousedown.stop.prevent
      />
    </Menu>
  </div>
</template>

<style lang="scss" scoped>
.year-selector {
  @apply flex flex-gap-x-1 items-center;

  &__previous,
  &__next {
    @apply w-8 h-8 p-3;
    @apply '!lt-xm:hidden';
  }
}
</style>
