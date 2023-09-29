<script setup lang="ts">
import { MaybeElementRef } from '@vueuse/core'

// TYPES
import type { ITextAreaInputProps } from '~/components/Inputs/TextArea/types/text-area-props.type'

// COMPOSITION FUNCTIONS
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'

const props = withDefaults(defineProps<ITextAreaInputProps>(), {
  debounce: 20,
  errorTakesSpace: true,
  errorVisible: true,
  mask: () => ({ mask: String }),
  rounded: true,
  size: 'md',
  stackLabel: undefined,
  labelInside: undefined,
  inline: undefined,
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
} = useInputUtils({
  props,
  maskRef: toRef(props, 'mask'),
})

if (props.autogrow) {
  useTextareaAutosize({
    element: el as MaybeElementRef<HTMLTextAreaElement>,
    input: maskedValue,
  })
}

const resizeClass = computedEager(() => {
  return props.autogrow ? 'resize-none' : props.resize
})

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
      :class="[inputClass, resizeClass]"
      :style="inputStyle"
      @focus="handleFocusOrClick"
    />

    <template
      v-if="$slots.append"
      #append
    >
      <div
        flex="~ center"
        fit
        @click="handleFocusOrClick"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />
      </div>
    </template>
  </InputWrapper>
</template>
