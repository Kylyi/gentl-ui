<script setup lang="ts">
import type { InputMask } from 'imask'
import type { MaybeElementRef } from '@vueuse/core'

// Types
import type { ITextAreaInputProps } from '~/components/Inputs/TextArea/types/text-area-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'

const props = withDefaults(defineProps<ITextAreaInputProps>(), {
  debounce: 0,
  errorTakesSpace: true,
  errorVisible: true,
  inline: undefined,
  labelInside: undefined,
  // @ts-expect-error Wrong IMask type
  mask: () => ({ mask: String }),
  required: undefined,
  rounded: true,
  size: 'md',
  stackLabel: undefined,
})

defineEmits<{
  (e: 'update:modelValue', val?: string | undefined | null): void
  (e: 'validation-reset', val?: string | undefined | null): void
  (e: 'blur'): void
  (e: 'focus'): void
}>()

const {
  el,
  inputId,
  masked,
  wrapperProps,
  hasClearableBtn,
  hasContent,
  isBlurred,
  label,
  focus,
  select,
  blur,
  clear,
  getInputElement,
  handleBlur,
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
    input: masked,
  })
}

const { path } = useInputValidationUtils(props)

const resizeClass = computed(() => {
  return props.autogrow ? 'resize-none' : props.resize
})

defineExpose({
  focus,
  select,
  blur,
  clear,
  getInputElement,
  updateMask: (fnc: (mask: InputMask<any>) => void) => {
    fnc(elMask.value as InputMask<any>)
  },
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
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
      :id="inputId"
      ref="el"
      flex="grow"
      :value="masked"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      autocomplete="off"
      :label="label || placeholder"
      :name="name || path || label || placeholder"
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
        self="start"
        @click="handleFocusOrClick"
      >
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

        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />
      </div>
    </template>

    <slot name="inner" />

    <template
      v-if="$slots.hint"
      #hint
    >
      <slot name="hint" />
    </template>

    <!-- Tooltip -->
    <Menu
      v-if="tooltip || !!$slots.tooltip"
      :model-value="!isBlurred"
      manual
      placement="right"
      :fallback-placements="['bottom']"
      :reference-target="el"
      :no-arrow="false"
      no-uplift
      v-bind="tooltipProps"
    >
      <slot name="tooltip">
        {{ tooltip }}
      </slot>
    </Menu>
  </InputWrapper>
</template>
