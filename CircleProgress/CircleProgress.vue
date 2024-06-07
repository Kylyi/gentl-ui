<script setup lang="ts">
// Types
import type { ICircleProgressProps } from '~/components/CircleProgress/types/circle-progress-props.type'

// Functions
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

const props = withDefaults(defineProps<ICircleProgressProps>(), {
  color: 'stroke-primary',
})

const circlePath = computed(() => 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')

// Utils
const { formatNumber } = useNumber()

// Layout
const animatedProgress = ref(0)

// Watch for changes in progress prop and update animatedProgress with smooth transition
watch(
  () => props.progress,
  newProgress => {
    animatedProgress.value = newProgress
  },
  { immediate: true },
)

const strokeDasharray = computed(() => `${props.progress * 100 / 100}, 100`)
</script>

<template>
  <div
    class="progress-container"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 36 36"
      class="circular-progress"
    >
      <path
        class="circle-bg"
        :d="circlePath"
        fill="none"
        stroke-width="3"
        stroke="#eee"
      />
      <path
        class="circle"
        :stroke-dasharray="strokeDasharray"
        :d="circlePath"
        fill="none"
        stroke-width="3.1"
        :class="color"
      />
    </svg>

    <div
      v-if="!noProgressText"
      class="progress-text"
      :class="ui?.textClass"
      :style="ui?.textStyle"
    >
      {{ formatNumber(progress) }}%
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  @apply relative flex flex-center;
}

.circular-progress {
  @apply rotate--90 origin-center;
}
.circle-bg {
  stroke-linecap: round;
}
.circle {
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.progress-text {
  @apply absolute text-lg font-semibold;
}
</style>
