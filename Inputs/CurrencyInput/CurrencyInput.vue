<script setup lang="ts">
import { MaskedNumber } from 'imask'

// Models
import { CurrencyModel } from '~/components/Inputs/CurrencyInput/models/currency.model'

// Types
import type { ICurrencyOptions } from '~/components/Inputs/CurrencyInput/types/currency-options.type'
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'

// Components
import Btn from '~/components/Button/Btn.vue'

const props = withDefaults(
  defineProps<Omit<INumberInputProps, 'mask' | 'step' | 'fractionDigits'>>(),
  {
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
  }
)

defineEmits<{
  (e: 'update:modelValue', val?: number | undefined | null): void
  (e: 'blur'): void
}>()

// Utils
const { path } = useInputValidationUtils(props)

const mask = ref<MaskedNumber>(new MaskedNumber())
const {
  inputId,
  wrapperProps,
  hasClearableBtn,
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
const model = defineModel<number | string>({ required: true })
const currencyModel = ref<CurrencyModel>()
const inputElement = ref<HTMLInputElement>()
const maskOptions = computed<ICurrencyOptions>(() => ({
  min: props.min,
  max: props.max,
  maskOpts: {
    empty: true,
    locale: 'sr-RS',
    digits: 2,
  },
}))

// Functions
function clear() {
  currencyModel.value?.clear()
  model.value = ''
}

// Lifecycle
onMounted(() => {
  currencyModel.value = new CurrencyModel(
    inputElement.value!,
    maskOptions.value
  )
})

onUnmounted(() => {
  currencyModel.value?.destroy()
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
    :has-content="!!model.toString().length"
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
      v-model.number="model"
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
          v-if="!readonly && !disabled && clearable"
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
