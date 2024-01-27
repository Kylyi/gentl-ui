<script setup lang="ts">
// Types
import type { IFieldProps } from '~/components/Field/types/field-props.type'

// Functions
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'

const props = defineProps<IFieldProps>()
defineEmits<{
  (e: 'focus', ev: FocusEvent | MouseEvent): void
}>()

// Utils
const { getInputWrapperProps } = useInputWrapperUtils()

// Layout
const controlEl = ref<HTMLDivElement>()

// Wrapper
const wrapperProps = getInputWrapperProps(props)

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
    {{ wrapperProps.zod }}
    <template
      v-if="$slots.prepend"
      #prepend
    >
      <slot name="prepend" />
    </template>

    <span
      ref="controlEl"
      class="control w-full"
      :class="[
        controlClass,
        inputClass,
        { 'is-placeholder': !modelValue && placeholder },
      ]"
      :style="inputStyle"
      tabindex="0"
      @focus="$emit('focus', $event)"
    >
      <slot> {{ modelValue || placeholder || '&nbsp;' }} </slot>
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

<style scoped lang="scss">
.is-placeholder {
  --apply: color-[#9ca3af];
}
</style>
