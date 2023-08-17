<script setup lang="ts">
// TYPES
import { ITextInputProps } from '~/components/Inputs/TextInput/types/text-input-props.type'

// COMPOSITION FUNCTIONS
import { useInputUtils } from '@/components/Inputs/functions/useInputUtils'

const props = withDefaults(defineProps<ITextInputProps>(), {
  debounce: 25,
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
  isBlurred,
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

const hasCopyBtn = computedEager(() => {
  return props.readonly && !props.disabled && !props.noCopy && !hasNoValue.value
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
    :has-content="hasContent || !hasNoValue"
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

    <input
      ref="el"
      :value="maskedValue"
      flex="1"
      :type="type"
      :inputmode="inputmode"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      autocomplete="off"
      :label="label || placeholder"
      :name="name || label || placeholder"
      class="control"
      role="presentation"
      :class="[inputClass]"
      :style="inputStyle"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <template
      v-if="$slots.append || hasCopyBtn"
      #append
    >
      <div
        flex="~ gap-x-1"
        fit
        items-center
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <CopyBtn
          v-if="hasCopyBtn"
          :size="size"
          :model-value="maskedValue"
        />
      </div>
    </template>

    <!-- TOOLTIP -->
    <Menu
      v-if="tooltip || !!$slots.tooltip"
      :model-value="!isBlurred"
      manual
      hide-header
      placement="right"
      :fallback-placements="['bottom']"
      :reference-target="el"
      :no-arrow="false"
    >
      <slot name="tooltip">
        {{ tooltip }}
      </slot>
    </Menu>
  </InputWrapper>
</template>
