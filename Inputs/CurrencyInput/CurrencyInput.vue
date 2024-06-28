<script setup lang="ts">
import { MaskedNumber } from 'imask'

// Types
import type { ICurrencyInputProps } from '~/components/Inputs/CurrencyInput/types/currency-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'
import { useCurrencyInputLayout } from '~/components/Inputs/CurrencyInput/functions/useCurrencyInputLayout'
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

// Components
import Btn from '~/components/Button/Btn.vue'

const props = withDefaults(defineProps<ICurrencyInputProps>(), {
  debounce: 0,
  errorTakesSpace: true,
  errorVisible: true,
  inline: undefined,
  labelInside: undefined,
  required: undefined,
  size: 'md',
  stackLabel: undefined,
  min: Number.NEGATIVE_INFINITY,
  max: Number.POSITIVE_INFINITY,
  currency: 'RSD',
  step: 'auto',
  fractionDigits: 2,
})

const emits = defineEmits<{
  (e: 'update:modelValue', val?: number | undefined | null): void
  (e: 'blur'): void
}>()

const model = defineModel<number | null>()

// Utils
const { path } = useInputValidationUtils(props)
const { separators } = useNumber()
const { pause, resume } = useIntervalFn(() => handleStep(), 120, {
  immediate: false,
  immediateCallback: true,
})

const mask = computed<MaskedNumber>(() => {
  return new MaskedNumber({
    thousandsSeparator: props.noGrouping
      ? ''
      : separators.value.thousandSeparator,
    radix: separators.value.decimalSeparator,
    mapToRadix: ['.', ','],
    scale: props.fractionDigits,
    mask: Number,
    min: props.min,
    max: props.max,
    format: (value: any) => {
      if (isNil(value)) {
        return ''
      }

      return value.toString()
    },
  })
})

const {
  inputId,
  wrapperProps,
  focus,
  select,
  blur,
  getInputElement,
  handleClickWrapper,
  handleFocusOrClick,
  handleBlur,
} = useInputUtils({
  props,
  maskRef: mask,
})

// Layout
const inputElement = ref<HTMLInputElement>()
const increment = ref<InstanceType<typeof Btn>>()
const decrement = ref<InstanceType<typeof Btn>>()
const modifier = ref<-1 | 1>(1)

const { inputValue, unmaskedInputValue, clear, masking, getPosition, onMasking, onClick }
  = useCurrencyInputLayout(props, emits)

const hasClearableBtn = computed(() => !props.readonly && !props.disabled)

watch(inputElement, () => {
  const initialValue = model.value ? model.value.toFixed(props.fractionDigits).toString() : ''
  inputValue.value = masking(initialValue)
})

watch(model, val => {
  if (isNil(val)) {
    inputValue.value = ''
  } else {
    // eslint-disable-next-line no-compare-neg-zero
    if (val === -0) {
      inputValue.value = `-${masking(val.toFixed(props.fractionDigits).toString())}`
    } else {
      inputValue.value = masking(val.toFixed(props.fractionDigits).toString())
    }
  }

  // Set cursor position
  nextTick(() => {
    const pos = inputValue.value?.length ? getPosition(inputValue.value) : 0
    inputElement.value!.setSelectionRange(pos, pos)
  })
})

// Functions
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

function handleStep() {
  let currentValue = model.value

  if (isNil(currentValue) || currentValue === 0) {
    currentValue = 0
  }

  const nextValue = +currentValue! + stepAdjusted.value * modifier.value
  inputValue.value = masking(nextValue?.toFixed(props.fractionDigits).toString() ?? '')

  model.value = unmaskedInputValue.value
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
    :has-content="!!inputValue?.toString().length"
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
      ref="inputElement"
      v-model="inputValue"
      flex="1"
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
      @input="onMasking($event)"
      @click="onClick"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    >

    <template
      v-if="$slots.append || hasClearableBtn || (!readonly && !disabled)"
      #append
    >
      <div
        v-if="hasClearableBtn || $slots.append"
        class="flex gap-x-2 flex-center p-x-2"
        @click="handleFocusOrClick"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <Btn
          v-if="inputValue?.length"
          icon="i-eva:close-fill h-6 w-6"
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
            icon="i-bi:caret-up-fill w-4 h-4"
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
            icon="i-bi:caret-up-fill rotate-180 w-4 h-4"
            color="ca"
            no-hover-effect
            touch-none
            @pointerdown="startStep($event, false)"
            @mousedown.stop.prevent
            @click.stop.prevent
          />
        </div>
      </div>
    </template>
  </InputWrapper>
</template>
