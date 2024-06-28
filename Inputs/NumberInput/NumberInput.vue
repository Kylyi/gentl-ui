<script setup lang="ts">
import { MaskedNumber, createMask } from 'imask'

// Types
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'

// Components
import type Btn from '~/components/Button/Btn.vue'

const props = withDefaults(defineProps<INumberInputProps>(), {
  debounce: 0,
  errorTakesSpace: true,
  errorVisible: true,
  fractionDigits: 2,
  inline: undefined,
  labelInside: undefined,
  // @ts-expect-error Wrong IMask type
  mask: () => ({ mask: String }),
  required: undefined,
  size: 'md',
  stackLabel: undefined,
  step: 'auto',
  min: Number.NEGATIVE_INFINITY,
  max: Number.POSITIVE_INFINITY,
})

defineEmits<{
  (e: 'update:modelValue', val?: number | undefined | null): void
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
    padFractionalZeros: true,
    scale: props.fractionDigits,
    mask: Number,
    min: props.min,
    max: props.max,
    format: (value: any) => {
      if (isNil(value)) {
        return ''
      }

      return value.toFixed(props.fractionDigits)
    },
  })
})

const {
  el,
  inputId,
  model,
  masked,
  typed,
  wrapperProps,
  hasNoValue,
  lastValidValue,
  hasClearableBtn,
  focus,
  select,
  blur,
  clear,
  getInputElement,
  handleClickWrapper,
  handleFocusOrClick,
  handleBlur,
} = useInputUtils({
  props,
  maskRef: mask,
  maskEventHandlers: {
    onAccept: (lastValidValue, ev, refs) => {
      console.log('Log ~ lastValidValue:', lastValidValue)
      console.log('Log ~ ev:', ev)

      if (!ev?.data) {
        return
      }

      let val = (lastValidValue ?? 0).toFixed(2).replace(/\./g, '')
      val += ev.data

      if (refs) {
        const typedValue = Number(`${val.slice(0, -2)}.${val.slice(-2)}`)

        refs.typed.value = typedValue
      }
    },
  },
})

const { path } = useInputValidationUtils(props)

// Step
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

function getValue(ev: InputEvent) {
  if (!ev.data) {
    return
  }

  let val = (lastValidValue.value ?? 0).toFixed(2).replace(/\./g, '')
  val += ev.data
  typed.value = Number(`${val.slice(0, -2)}.${val.slice(-2)}`)

  // console.log('Log ~ getValue ~ ev:', ev)
  // if (!ev) {
  //   return
  // }

  // // Initialize the value, making sure we have the fraction digits part
  // let val = lastValidValue.value || '0.00'
  // console.log('Log ~ getValue ~ val:', val)

  // // Make sure we have the correct number of fraction digits
  // const [_, decimals] = val.split('.')

  // if (decimals?.length < props.fractionDigits) {
  //   val = Number(val).toFixed(props.fractionDigits)
  //   console.log('Log ~ getValue ~ val:', val)
  // }

  // // Replace the non-numeric characters (also remove the decimal point)
  // val = val.replace(/[.,_\s]/g, '')
  // console.log('Log ~ getValue ~ val:', val)

  // // Append the new value to the end of the string
  // if (!Number.isNaN(Number(ev.data))) {
  //   val += ev.data
  //   console.log('Log ~ getValue ~ val:', val)
  // }

  // // Construct the typed value
  // const typedValue = Number(`${val.slice(0, -2)}.${val.slice(-2)}`)

  // console.log('Log ~ getValue ~ typedValue:', typedValue)
  // // Put it through the mask to get the formatted value
  // const temporaryMask = createMask(mask.value)
  // temporaryMask.typedValue = typedValue

  // masked.value = temporaryMask.value
}

defineExpose({
  focus,
  select,
  blur,
  clear,
  getInputElement,
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
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
      :id="inputId"
      ref="el"
      flex="1"
      :value="masked"
      inputmode="numeric"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :label="label || placeholder"
      :name="name || path || label || placeholder"
      class="control"
      role="presentation"
      :class="[inputClass]"
      :style="inputStyle"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
      @input="getValue"
    >
  </InputWrapper>
</template>

<style lang="scss" scoped>
.number-input__step {
  @apply flex gap-x-2 flex-center p-x-2;
}
</style>
