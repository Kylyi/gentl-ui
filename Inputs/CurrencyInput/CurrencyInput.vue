<script setup lang="ts">
import { MaskedNumber } from 'imask'

// Types
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'

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

// Layout
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
    onAccept: (_, ev, refs) => {
      if (!ev) {
        return
      }

      const input = el.value as HTMLInputElement

      if (!input) {
        return
      }

      if (refs) {
        const [_, decimals] = refs.masked.value.split(separators.value.decimalSeparator)

        // We make sure we have the correct number of fraction digits
        // and recalculate the typed value
        if (!decimals || decimals?.length < props.fractionDigits) {
          const digits = decimals ? props.fractionDigits - decimals.length : props.fractionDigits

          const val = (refs?.typed.value ?? 0).toFixed(digits).replace(/\./g, '')
          const typedValue = Number(`${val.slice(0, -1 * props.fractionDigits)}.${val.slice(-1 * props.fractionDigits)}`)

          refs.typed.value = typedValue

          // When no decimals are provided, we need to reset the input focus for mask to refresh
          if (!decimals) {
            blur()
            nextTick(() => focus())
          }
        }
      }
    },
  },
})

const { path } = useInputValidationUtils(props)

function handleBeforeInput(ev: Event) {
  const input = el.value as HTMLInputElement

  if (!input || !(ev instanceof InputEvent)) {
    return
  }

  const isAllSelected = input.selectionStart === 0
    && input.selectionEnd === input.value.length
    && input.value.length > 0

  const isAtEnd = input.selectionStart === input.value.length

  // When the entire text is selected and we're adding a digit, we need to
  // initialize the value to `0.0` and add the digit
  if (isAllSelected && ev.data) {
    if (ev.data.length === 1) {
      typed.value = Number(`0.0${ev.data}`)
    }
  }

  // When the entire text is selected and we're not providing any data (backspace/delete),
  // we reset the value to the `emptyValue`
  else if (isAllSelected) {
    typed.value = props.emptyValue
  }

  // When we're providing data, we need to make sure we have the correct number of fraction digits
  else if (ev.data && isAtEnd) {
    let val = (lastValidValue.value ?? 0).toFixed(props.fractionDigits).replace(/\./g, '')
    val += ev.data

    typed.value = Number(`${val.slice(0, -1 * props.fractionDigits)}.${val.slice(-1 * props.fractionDigits)}`)
    ev.preventDefault()
    ev.stopPropagation()
    ev.stopImmediatePropagation()
  }
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
      @beforeinput="handleBeforeInput"
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
