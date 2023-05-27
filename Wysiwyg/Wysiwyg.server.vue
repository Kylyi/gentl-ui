<script setup lang="ts">
// TYPES
import type { IWysiwygProps } from '~~/components/Wysiwyg/types/wysiwyg-props.type'

const props = defineProps<IWysiwygProps>()

// WRAPPER
const wrapperProps = reactivePick(
  props,
  'contentClass',
  'contentStyle',
  'disabled',
  'emptyValue',
  'errors',
  'errorTakesSpace',
  'errorVisible',
  'hint',
  'inline',
  'label',
  'labelClass',
  'labelInside',
  'labelStyle',
  'loading',
  'placeholder',
  'readonly',
  'required',
  'size',
  'stackLabel'
)
</script>

<template>
  <InputWrapper v-bind="wrapperProps">
    <p
      class="control"
      v-html="modelValue"
    />
  </InputWrapper>
</template>

<style lang="scss" scoped>
:deep(.wysiwyg) {
  --apply: outline-none p-x-2;
}
</style>
