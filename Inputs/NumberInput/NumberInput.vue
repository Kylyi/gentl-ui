<script setup lang="ts">
// eslint-disable-next-line import/named
import { MaskedNumber } from 'imask'

// TYPES
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

// COMPOSITION FUNCTIONS
import { useInputUtils } from '@/components/Inputs/functions/useInputUtils'
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

// COMPONENTS
import Btn from '~~/components/Button/Btn.vue'

const props = withDefaults(defineProps<INumberInputProps>(), {
  debounce: 150,
  errorTakesSpace: true,
  errorVisible: true,
  fractionDigits: 2,
  mask: () => ({ mask: String }),
  rounded: true,
  size: 'md',
  step: 'auto',
})

defineEmits<{
  (e: 'update:model-value', val?: string | undefined | null): void
  (e: 'blur'): void
}>()

// UTILS
const { separators } = useNumber()

// MASK
// @ts-expect-error IMask type
const mask = computed<MaskedNumber>(() => {
  return {
    thousandsSeparator: props.noGrouping
      ? ''
      : separators.value.thousandSeparator,
    radix: separators.value.decimalSeparator,
    mapToRadix: ['.', ','],
    scale: props.fractionDigits,
    signed: true,
    ...(props.mask || {}),
    mask: Number,
    min: props.min,
    max: props.max,
  }
})

const {
  el,
  maskedValue,
  typedValue,
  wrapperProps,
  hasNoValue,
  focus,
  select,
  blur,
  reset,
  touch,
  clear,
  getInputElement,
  handleManualModelChange,
  handleClickWrapper,
  handleFocusOrClick,
  handleBlur,
} = useInputUtils({
  props,
  maskRef: mask,
})

// STEP
const increment = ref<InstanceType<typeof Btn>>()
const decrement = ref<InstanceType<typeof Btn>>()
const modifier = ref<-1 | 1>(1)

const stepAdjusted = computed(() => {
  if (!typedValue.value) {
    return typeof props.step === 'number' ? props.step : 1
  }

  if (props.step !== 'auto') {
    return props.step || 0
  }

  if (+typedValue.value <= 200) {
    return 1
  } else if (+typedValue.value <= 20000) {
    return 100
  } else {
    return 1000
  }
})

const { pause, resume } = useIntervalFn(() => handleStep(), 80, {
  immediate: false,
  immediateCallback: true,
})

function handleStep() {
  let currentValue = typedValue.value

  if (
    isNil(currentValue) ||
    currentValue === '' ||
    currentValue === props.emptyValue
  ) {
    currentValue = 0
  }

  const nextValue = +currentValue + stepAdjusted.value * modifier.value
  handleManualModelChange(nextValue, true)
}

function startStep(_: PointerEvent, increment = true) {
  touch()
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

defineExpose({
  focus,
  select,
  blur,
  reset,
  touch,
  clear,
  getInputElement,
  handleManualModelChange,
  sync: () => handleManualModelChange(props.modelValue),
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :has-content="!hasNoValue"
    @click.stop.prevent="handleClickWrapper"
  >
    <template
      v-if="$slots.prepend"
      #prepend
    >
      <slot
        name="prepend"
        :clear="clear"
        :focus="focus"
      />
    </template>

    <input
      ref="el"
      :value="maskedValue"
      flex="1"
      inputmode="numeric"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :label="label || placeholder"
      :name="name || label || placeholder"
      class="control"
      role="presentation"
      :class="[inputClass]"
      :style="inputStyle"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    />

    <template
      v-if="$slots.append || (!readonly && !disabled)"
      #append
    >
      <div
        v-if="step || $slots.append"
        class="number-input__step"
        @click="handleFocusOrClick"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <!-- STEP -->
        <div
          v-if="step && !readonly && !disabled"
          flex="~ col shrink"
          w="4"
        >
          <Btn
            ref="increment"
            tabindex="-1"
            size="auto"
            icon="bi:caret-up-fill w-4 h-4"
            color="ca"
            no-hover-effect
            touch-none
            @pointerdown="startStep($event, true)"
            @mousedown.stop.prevent=""
          />
          <Btn
            ref="decrement"
            tabindex="-1"
            size="auto"
            icon="bi:caret-up-fill rotate-180 w-4 h-4"
            color="ca"
            no-hover-effect
            touch-none
            @pointerdown="startStep($event, false)"
            @mousedown.stop.prevent=""
          />
        </div>
      </div>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.number-input__step {
  --apply: flex gap-x-2 flex-center p-x-2 fit;
}
</style>
