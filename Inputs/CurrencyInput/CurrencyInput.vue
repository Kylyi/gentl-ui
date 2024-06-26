<script setup lang="ts">
import { MaskedNumber } from 'imask'

// Types
import type { ICurrencyInputProps } from '~/components/Inputs/CurrencyInput/types/currency-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'
import { useCurrencyInputLayout } from '~/components/Inputs/CurrencyInput/functions/useCurrencyInputLayout'

// Components
import Btn from '~/components/Button/Btn.vue'
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

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
  locale: 'sr-RS',
  currency: 'RSD',
})

const emits = defineEmits<{
  (e: 'update:modelValue', val?: number | undefined | null): void
  (e: 'blur'): void
}>()

const model = defineModel<number | null>()

// Utils
const { path } = useInputValidationUtils(props)
const { separators } = useNumber()

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

const { inputValue, clear, init, masking } = useCurrencyInputLayout(
  props,
  emits,
  inputElement
)

const hasClearableBtn = computed(
  () =>
    !props.readonly &&
    !props.disabled &&
    props.clearable &&
    props.modelValue &&
    !!props.modelValue.toString().length
)

watch(inputElement, init)

watch(model, val => {
  inputValue.value = masking(val?.toFixed(2).toString() ?? '0,00')
})

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
    :has-content="!!inputValue.toString().length"
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
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    />

    <template
      v-if="$slots.append || hasClearableBtn || (!readonly && !disabled)"
      #append
    >
      <div
        v-if="hasClearableBtn || $slots.append"
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
      </div>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.number-input__step {
  --apply: flex gap-x-2 flex-center p-x-2;
}
</style>
