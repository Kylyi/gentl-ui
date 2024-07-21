<script setup lang="ts">
import { MaskedNumber } from 'imask'

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
  min: Number.NEGATIVE_INFINITY,
  max: Number.POSITIVE_INFINITY,
})

defineEmits<{
  (e: 'update:modelValue', val?: number | undefined | null): void
  (e: 'blur'): void
  (e: 'focus'): void
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
