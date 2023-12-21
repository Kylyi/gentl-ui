<script setup lang="ts">
import { MaskedNumber } from 'imask'

// Types
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

// Components
import Btn from '~/components/Button/Btn.vue'

const props = withDefaults(defineProps<INumberInputProps>(), {
  debounce: 0,
  errorTakesSpace: true,
  errorVisible: true,
  fractionDigits: 2,
  inline: undefined,
  labelInside: undefined,
  mask: () => ({ mask: String }),
  required: undefined,
  size: 'md',
  stackLabel: undefined,
  step: 'auto',
  min: Number.NEGATIVE_INFINITY,
  max: Number.POSITIVE_INFINITY,
})

defineEmits<{
  (e: 'update:model-value', val?: number | undefined | null): void
  (e: 'blur'): void
}>()

// Utils
const { separators } = useNumber()

// Mask
const mask = computed<MaskedNumber>(() => {
  return new MaskedNumber({
    thousandsSeparator: props.noGrouping
      ? ''
      : separators.value.thousandSeparator,
    radix: separators.value.decimalSeparator,
    mapToRadix: ['.', ','],
    scale: props.fractionDigits,
    ...(props.mask || {}),
    mask: Number,
    min: props.min,
    max: props.max,
    // @ts-expect-error imask type
    format: (value: any) => {
      if (isNil(value)) {
        return ''
      }

      return value.toString()
    },
  })
})

const {
  el,
  maskedValue,
  typedValue,
  wrapperProps,
  hasNoValue,
  hasClearableBtn,
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

// Step
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

const { pause, resume } = useIntervalFn(() => handleStep(), 120, {
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

  const nextValue = +currentValue! + stepAdjusted.value * modifier.value
  handleManualModelChange(nextValue, false)
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
    .focus="focus"
    @click="handleClickWrapper"
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
      :name="name || validation?.$path || label || placeholder"
      class="control"
      role="presentation"
      :class="[inputClass]"
      :style="inputStyle"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    />

    <template
      v-if="$slots.append || hasClearableBtn || (!readonly && !disabled)"
      #append
    >
      <div
        v-if="step || hasClearableBtn || $slots.append"
        class="number-input__step"
        @click="handleFocusOrClick"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <Btn
          v-if="hasClearableBtn"
          icon="eva:close-fill h-6 w-6"
          color="ca"
          size="auto"
          h="7"
          w="7"
          tabindex="-1"
          @click.stop.prevent="!clearConfirmation && clear()"
        >
          <MenuConfirmation
            v-if="clearConfirmation"
            @ok="clear"
          >
            {{ clearConfirmation }}
          </MenuConfirmation>
        </Btn>

        <!-- Step -->
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
