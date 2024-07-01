<script setup lang="ts">
import { MaskedNumber } from 'imask'
import { config } from '~/components/config/components-config'

// Types
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'

// Components
import Btn from '~/components/Button/Btn.vue'

const props = withDefaults(defineProps<INumberInputProps>(), {
  debounce: 0,
  errorTakesSpace: true,
  errorVisible: true,
  fractionDigits: 2,
  inline: undefined,
  labelInside: undefined,
  // @ts-expect-error Wrong IMask type, will be overriden anyway
  mask: () => ({ mask: String }),
  required: undefined,
  size: 'md',
  stackLabel: undefined,
  step: isUndefined(config.numberInput?.props?.step) ? 'auto' : config.numberInput?.props?.step,
  min: Number.NEGATIVE_INFINITY,
  max: Number.POSITIVE_INFINITY,
})

defineEmits<{
  (e: 'update:modelValue', val?: number | undefined | null): void
  (e: 'blur'): void
  (e: 'clear'): void
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
  el,
  inputId,
  model,
  masked,
  wrapperProps,
  hasNoValue,
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
    >

    <template
      v-if="$slots.append || hasClearableBtn || (!readonly && !disabled)"
      #append
    >
      <div
        v-if="step || hasClearableBtn || $slots.append"
        class="number-input__append"
        @click="handleFocusOrClick"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <Btn
          v-if="hasClearableBtn"
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
        <NumberInputStep
          v-if="step && !readonly && !disabled"
          v-bind="props"
          v-model="model"
        />
      </div>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.number-input__append {
  @apply flex gap-x-2 flex-center p-x-2;
}
</style>
