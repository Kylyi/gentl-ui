<script setup lang="ts">
// TYPES
import type { IFieldProps } from '~~/components/Field/types/field-props.type'

const props = defineProps<IFieldProps>()
defineEmits<{
  (e: 'focus', ev: FocusEvent | MouseEvent): void
}>()

// LAYOUT
const controlEl = ref<HTMLDivElement>()

// WRAPPER
const wrapperProps = reactivePick(
  props,
  'contentClass',
  'contentStyle',
  'disabled',
  'errors',
  'errorTakesSpace',
  'errorVisible',
  'hint',
  'inline',
  'label',
  'labelClass',
  'labelStyle',
  'labelInside',
  'loading',
  'noBorder',
  'placeholder',
  'readonly',
  'required',
  'size',
  'stackLabel'
)

defineExpose({
  focus: () => controlEl.value?.focus(),
  blur: () => controlEl.value?.blur(),
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    error-visible
    :has-content="!noContent"
  >
    <template
      v-if="$slots.prepend"
      #prepend
    >
      <slot name="prepend" />
    </template>

    <span
      ref="controlEl"
      class="control w-full"
      :class="[controlClass, inputClass]"
      :style="inputStyle"
      tabindex="0"
      @focus="$emit('focus', $event)"
    >
      <slot> {{ modelValue || '&nbsp;' }} </slot>
    </span>

    <template
      v-if="$slots.append || (!readonly && !disabled)"
      #append
    >
      <div
        flex="~ center"
        fit
        @click="$emit('focus', $event)"
      >
        <slot name="append" />
      </div>
    </template>
  </InputWrapper>
</template>
