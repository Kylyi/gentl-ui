<script setup lang="ts">
// TYPES
import type { IFieldProps } from '~~/components/Field/types/field-props.type'

const props = defineProps<IFieldProps>()

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
  'placeholder',
  'readonly',
  'required',
  'size',
  'stackLabel'
)
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

    <span class="control w-full">
      <slot> &nbsp; </slot>
    </span>

    <template
      v-if="$slots.append || (!readonly && !disabled)"
      #append
    >
      <slot name="append" />
    </template>
  </InputWrapper>
</template>
