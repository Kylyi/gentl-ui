<script setup lang="ts">
import type { Dayjs } from 'dayjs'

import { type AnyMaskedOptions, MaskedRange } from 'imask'

// Types
import type { IDateInputProps } from '~/components/Inputs/DateInput/types/date-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'

// Components
import DatePicker from '~/components/DatePicker/DatePicker.vue'
import InputWrapper from '~/components/Inputs/InputWrapper.vue'
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'

const props = withDefaults(defineProps<IDateInputProps>(), {
  autoClose: true,
  debounce: 0,
  emptyValue: () => undefined,
  errorTakesSpace: true,
  errorVisible: true,
  immediate: true,
  inline: undefined,
  labelInside: undefined,
  required: undefined,
  stackLabel: undefined,
})

defineEmits<{
  (e: 'update:model-value', val?: Datetime): void
  (e: 'validation-reset', val?: string | undefined | null): void
  (e: 'blur'): void
}>()

// Utils
const { getCurrentLocaleDateFormat } = useLocale()
const { formatDate, parseDate } = useDateUtils()

function isDate(date?: any) {
  if (date === '' || isNil(date) || date === props.emptyValue) {
    return false
  }

  return true
}

function isMaskString(val?: string) {
  return val === PATTERN.value
}

// Mask
const PATTERN = computed(() => getCurrentLocaleDateFormat())

const mask = computed<AnyMaskedOptions>(() => {
  return {
    mask: PATTERN.value,
    pattern: PATTERN.value,
    lazy: false,
    blocks: {
      DD: {
        mask: MaskedRange,
        placeholderChar: 'D',
        autofix: 'pad',
        from: 1,
        to: 31,
        maxLength: 2,
      },
      MM: {
        mask: MaskedRange,
        placeholderChar: 'M',
        autofix: 'pad',
        from: 1,
        to: 12,
        maxLength: 2,
      },
      YYYY: {
        mask: MaskedRange,
        placeholderChar: 'Y',
        autofix: 'pad',
        from: 1900,
        to: 2999,
        maxLength: 4,
      },
    },
    format: (val: any) => {
      if (!isDate(val)) {
        return PATTERN.value
      }
      if (isMaskString(val)) {
        return val
      }

      return formatDate(val)
    },
    parse: (val: any) => {
      if (!isDate(val)) {
        return props.emptyValue
      }
      if (isMaskString(val)) {
        return val
      }

      return props.format
        ? parseDate(val, { isLocalString: true }).format(props.format)
        : parseDate(val, { isLocalString: true })
    },
  }
})

// Layout
const preventSync = autoResetRef(false, 50)
const wrapperEl = ref<InstanceType<typeof InputWrapper>>()
const usedTouch = ref(false)

function handleDateSelect(val: Dayjs) {
  preventSync.value = true
  touch()

  if (props.format) {
    handleManualModelChange(val.format(props.format))
  } else {
    handleManualModelChange(val)
  }

  if (props.autoClose) {
    menuProxyEl.value?.hide()
  }
}

// Picker
const menuProxyEl = ref<InstanceType<typeof MenuProxy>>()
const datePickerEl = ref<InstanceType<typeof DatePicker>>()
const isPickerActive = ref(false)

function handlePickerHide() {
  usedTouch.value = false
  isPickerActive.value = false
}

const {
  el,
  typedValue,
  maskedValue,
  wrapperProps,
  hasNoValue,
  hasClearableBtn,
  handleManualModelChange,
  handleFocusOrClick,
  handleClickWrapper,
  focus,
  select,
  blur,
  reset,
  touch,
  clear,
  getInputElement,
} = useInputUtils({
  props,
  maskRef: mask,
  maskEventHandlers: {
    onCompleted: () => {
      if (!preventSync.value) {
        nextTick(() => datePickerEl.value?.sync())
      }
    },
  },
  menuElRef: menuProxyEl,
  preventFocusOnTouch: true,
})

defineExpose({
  focus,
  select,
  blur,
  reset,
  touch,
  clear,
  getInputElement,
})
</script>

<template>
  <InputWrapper
    ref="wrapperEl"
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

    <input
      ref="el"
      :value="typedValue ? maskedValue : undefined"
      flex="1"
      type="text"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :label="label || placeholder"
      :name="name || validation?.$path || label || placeholder"
      class="control"
      :class="[inputClass]"
      v-bind="inputProps"
      @focus.stop.prevent="handleFocusOrClick"
    />

    <template #append>
      <div
        v-if="$slots.append || (!readonly && !disabled)"
        flex="~ gap-1 center"
        fit
        @click="handleFocusOrClick"
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

        <div
          system-uicons:calendar-date
          class="picker-icon"
        />
      </div>
    </template>

    <template #menu>
      <MenuProxy
        ref="menuProxyEl"
        v-model="isPickerActive"
        manual
        hide-header
        :cover="usedTouch"
        dense
        position="top"
        placement="bottom-start"
        no-uplift
        :fit="false"
        :reference-target="el"
        h="!auto"
        w="!auto"
        min-w="!280px"
        max-w="!400px"
        overflow="hidden"
        @hide="handlePickerHide"
      >
        <DatePicker
          ref="datePickerEl"
          :model-value="modelValue"
          :allowed-days="allowedDays"
          :disabled-days="disabledDays"
          @mousedown.stop.prevent
          @update:model-value="handleDateSelect"
        />
      </MenuProxy>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.picker-icon {
  --apply: cursor-pointer color-ca m-x-2 h-6 w-6;
}

.input-wrapper {
  &--xs,
  &--sm {
    .picker-icon {
      --apply: h-5 w-5;
    }
  }
}
</style>
