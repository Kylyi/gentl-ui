<script setup lang="ts">
import { InputMask } from 'imask'
import { type MaybeElementRef } from '@vueuse/core'

// Types
import type { ITextAreaInputProps } from '~/components/Inputs/TextArea/types/text-area-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'

const props = withDefaults(defineProps<ITextAreaInputProps>(), {
  debounce: 0,
  errorTakesSpace: true,
  errorVisible: true,
  inline: undefined,
  labelInside: undefined,
  mask: () => ({ mask: String }),
  required: undefined,
  rounded: true,
  size: 'md',
  stackLabel: undefined,
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
  hasClearableBtn,
  hasContent,
  focus,
  select,
  blur,
  reset,
  touch,
  clear,
  getInputElement,
  handleBlur,
  handleManualModelChange,
  handleClickWrapper,
  handleFocusOrClick,
  elMask,
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
  updateMask: (fnc: (mask: InputMask<any>) => void) => {
    fnc(elMask.value as InputMask<any>)
  },
  handleManualModelChange,
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :has-content="hasContent"
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

    <textarea
      ref="el"
      flex="grow"
      :value="maskedValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      autocomplete="off"
      :label="label || placeholder"
      :name="name || validation?.path || label || placeholder"
      class="control"
      role="presentation"
      :rows="rows"
      :class="[inputClass, resizeClass]"
      :style="inputStyle"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    />

    <template
      v-if="$slots.append || hasClearableBtn"
      #append
    >
      <div
        flex="~ center gap-1"
        fit
        @click="handleFocusOrClick"
      >
        <Btn
          v-if="hasClearableBtn"
          icon="eva:close-fill h-6 w-6"
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

        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />
      </div>
    </template>
  </InputWrapper>
</template>
