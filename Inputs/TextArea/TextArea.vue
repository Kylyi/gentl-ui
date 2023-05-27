<script setup lang="ts">
import { MaybeElementRef } from '@vueuse/core'

// TYPES
import type { ITextAreaInputProps } from '~/components/Inputs/TextArea/types/text-area-props.type'

// COMPOSITION FUNCTIONS
import { useInputUtils } from '@/components/Inputs/functions/useInputUtils'

const props = withDefaults(defineProps<ITextAreaInputProps>(), {
  debounce: 150,
  errorTakesSpace: true,
  errorVisible: true,
  mask: () => ({ mask: String }),
  rounded: true,
  size: 'md',
})

defineEmits<{
  (e: 'update:model-value', val?: string | undefined | null): void
  (e: 'validation-reset', val?: string | undefined | null): void
  (e: 'blur'): void
}>()

const {
  el,
  maskedValue,
  wrapperProps,
  hasNoValue,
  handleFocus,
  handleBlur,
  handleMouseDown,
  focus,
  select,
  blur,
  reset,
  touch,
  clear,
  getInputElement,
  handleManualModelChange,
} = useInputUtils({
  props,
  maskRef: toRef(props, 'mask'),
})

if (props.autogrow) {
  useTextareaAutosize({
    element: el as MaybeElementRef<HTMLTextAreaElement>,
  })
}

defineExpose({
  focus,
  select,
  blur,
  reset,
  touch,
  clear,
  getInputElement,
  sync: () => handleManualModelChange(props.modelValue),
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :has-content="!hasNoValue"
    @mousedown="handleMouseDown"
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

    <textarea
      ref="el"
      flex="grow"
      :value="maskedValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      autocomplete="off"
      :label="label || placeholder"
      :name="name || label || placeholder"
      class="control"
      role="presentation"
      :rows="rows"
      :class="[inputClass, resize]"
      :style="inputStyle"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <template
      v-if="$slots.append"
      #append
    >
      <slot
        name="append"
        :clear="clear"
        :focus="focus"
      />
    </template>
  </InputWrapper>
</template>
