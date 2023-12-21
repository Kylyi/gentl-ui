<script setup lang="ts">
// Types
import { type ITextInputProps } from '~/components/Inputs/TextInput/types/text-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'

defineOptions({
  customOptions: {
    test: 'a',
  },
})
const props = withDefaults(defineProps<ITextInputProps>(), {
  allowIncompleteMaskValue: false,
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
  (e: 'enter', event: KeyboardEvent): void
}>()

const {
  el,
  maskedValue,
  wrapperProps,
  hasContent,
  isBlurred,
  hasClearableBtn,
  handleFocus,
  handleBlur,
  handleClickWrapper,
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
  maskEventHandlers: props.maskEventHandlers,
})

const hasCopyBtn = computedEager(() => {
  return props.readonly && !props.disabled && !props.noCopy && hasContent.value
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
      :name="name || validation?.$path || label || placeholder"
      class="control"
      role="presentation"
      :class="[inputClass, { 'custom-enter': !!customEnter }]"
      :style="inputStyle"
      v-bind="inputProps"
      @focus="handleFocus"
      @blur="handleBlur"
      @keypress.enter="$emit('enter', $event)"
    />

    <template
      v-if="$slots.append || hasCopyBtn || clearable"
      #append
    >
      <div
        flex="~ gap-1 items-center"
        fit
        p="x-2"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

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

        <CopyBtn
          v-if="hasCopyBtn"
          :size="size"
          :model-value="maskedValue"
        />
      </div>
    </template>

    <!-- Tooltip -->
    <Menu
      v-if="tooltip || !!$slots.tooltip"
      :model-value="!isBlurred"
      manual
      hide-header
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
