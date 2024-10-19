<script setup lang="ts">
// Types
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

// Components
import type Btn from '~/components/Button/Btn.vue'

const props = defineProps<INumberInputProps>()

// Layout
const model = defineModel<INumberInputProps['modelValue']>()
const increment = ref<InstanceType<typeof Btn>>()
const decrement = ref<InstanceType<typeof Btn>>()
const modifier = ref<-1 | 1>(1)

const stepAdjusted = computed(() => {
  if (!model.value) {
    return typeof props.step === 'number' ? props.step : 1
  }

  if (props.step !== 'auto') {
    return props.step || 0
  }

  if (+model.value <= 200) {
    return 1
  } else if (+model.value <= 20000) {
    return 100
  } else {
    return 1000
  }
})

const { pause, resume } = useIntervalFn(() => handleStep(), 120, {
  immediate: false,
  immediateCallback: true,
})

function handleStep() {
  let currentValue = model.value

  if (
    isNil(currentValue)
    || currentValue === ''
    || currentValue === props.emptyValue
  ) {
    currentValue = 0
  }

  const nextValue = +currentValue! + stepAdjusted.value * modifier.value
  model.value = nextValue
}

function startStep(_: PointerEvent, increment = true) {
  modifier.value = increment ? 1 : -1

  window.addEventListener('pointerup', stopStep)
  window.addEventListener('mouseup', stopStep)
  window.addEventListener('touchend', stopStep)
  window.addEventListener('touchmove', stopStep)
  window.addEventListener('touchcancel', stopStep)
  resume()
}

function stopStep() {
  pause()
  window.removeEventListener('pointerup', stopStep)
  window.removeEventListener('mouseup', stopStep)
  window.removeEventListener('touchend', stopStep)
  window.removeEventListener('touchmove', stopStep)
  window.removeEventListener('touchcancel', stopStep)
}
</script>

<template>
  <div
    class="number-input__step"
    :class="`is--${size}`"
  >
    <Btn
      ref="increment"
      tabindex="-1"
      size="auto"
      icon="step-icon i-bi:caret-up-fill"
      color="ca"
      no-hover-effect
      touch-none
      @pointerdown="startStep($event, true)"
      @mousedown.stop.prevent
      @click.stop.prevent
    />
    <Btn
      ref="decrement"
      tabindex="-1"
      size="auto"
      icon="step-icon i-bi:caret-up-fill rotate-180"
      color="ca"
      no-hover-effect
      touch-none
      @pointerdown="startStep($event, false)"
      @mousedown.stop.prevent
      @click.stop.prevent
    />
  </div>
</template>

<style lang="scss" scoped>
.number-input__step {
  @apply flex flex-col shrink w-4;
}

.is--sm {
  :deep(.step-icon) {
    @apply w-3 h-3;
  }
}

.is--md,
.is--lg {
  :deep(.step-icon) {
    @apply w-4 h-4;
  }
}
</style>
