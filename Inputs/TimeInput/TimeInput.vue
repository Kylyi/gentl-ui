<script setup lang="ts">
// TODO: am/pm values are not reactive on language change (broken only for 13h for some reason...)

import { type FactoryOpts, MaskedRange } from 'imask'

// Types
import type { ITimeInputProps } from '~/components/Inputs/TimeInput/types/time-input-props.type'

// Functions
import { useInputUtils } from '~/components/Inputs/functions/useInputUtils'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'

// Components
import InputWrapper from '~/components/Inputs/InputWrapper.vue'
import TimeInputPicker from '~/components/Inputs/TimeInput/TimeInputPicker.vue'

const props = withDefaults(defineProps<ITimeInputProps>(), {
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
  (e: 'update:modelValue', val?: Datetime): void
  (e: 'validation-reset', val?: string | undefined | null): void
  (e: 'blur'): void
  (e: 'clear'): void
}>()

// Utils
const { localeUses24HourTime } = useDateUtils()

const is12h = computed(() => !localeUses24HourTime())

function isTime(time: any) {
  if (time === '' || isNil(time) || time === props.emptyValue) {
    return false
  }

  return true
}

function isMaskString(val?: string) {
  return val === PATTERN
}

function localizeTime(time?: string | undefined) {
  if (!isTime(time) || isMaskString(time)) {
    return ''
  }

  const [hh, mm] = time!.split(':')

  if (is12h.value && +hh > 13) {
    return `${padStart(String(+hh % 12), 2, '0')}:${mm}`
  } else if (is12h.value && +hh < 1) {
    return `12:${mm}`
  }

  return time
}

function delocalizeTime(time?: string | undefined) {
  if (!isTime(time) || isMaskString(time)) {
    return ''
  }

  const [hh, mm] = time!.split(':')

  if (is12h.value && !isAm.value && +hh < 12) {
    return `${+hh + 12}:${mm}`
  }

  return time
}

// Constants
const PATTERN = 'HH:mm'

// Layout
const preventNextIsAmChange = autoResetRef(false, 50)

const delocalizedTimeParts = computed(() => {
  const time = props.modelValue || '12:00'

  return {
    hh: time.split(':')[0],
    mm: time.split(':')[1],
  }
})

// Mask
const maskFullTime = computed<FactoryOpts>(() => {
  return {
    mask: PATTERN,
    pattern: PATTERN,
    lazy: false,
    overwrite: true,
    blocks: {
      HH: {
        mask: MaskedRange,
        autofix: 'pad',
        placeholderChar: 'H',
        from: is12h.value ? 1 : 0,
        to: is12h.value ? 12 : 23,
        maxLength: 2,
      },
      mm: {
        mask: MaskedRange,
        autofix: 'pad',
        placeholderChar: 'm',
        from: 0,
        to: 59,
        maxLength: 2,
      },
    },
    format: (val: string) => {
      if (!isTime(val)) {
        return PATTERN
      }

      if (isMaskString(val)) {
        return val
      }

      return localizeTime(val) as string
    },
    parse: (val: string) => {
      if (!isTime(val)) {
        return props.emptyValue
      }

      if (isMaskString(val)) {
        return val
      }

      return delocalizeTime(val)
    },
  }
})

// Layout
const wrapperEl = ref<InstanceType<typeof InputWrapper>>()
const isAm = ref(+delocalizedTimeParts.value.hh < 12)

const modelValueLocalized = computed(() => localizeTime(props.modelValue))

const propsExtended = reactiveComputed(() => ({
  ...props,
  modelValue: modelValueLocalized.value,
}))

const {
  el,
  inputId,
  masked,
  model,
  wrapperProps,
  hasNoValue,
  hasClearableBtn,
  focus,
  select,
  blur,
  clear,
  getInputElement,
  handleClickWrapper,
  handleFocusOrClick,
  handleBlur,
} = useInputUtils({
  props: propsExtended,
  maskRef: maskFullTime,
  preventFocusOnTouch: true,
  menuElRef: () => timeInputPickerEl.value?.getMenuEl(),
})

function handleInput(ev: Event) {
  const { data } = ev as InputEvent

  if (is12h.value && data) {
    const dataLowercase = data.toLocaleLowerCase()

    if (dataLowercase === 'a') {
      isAm.value = true
    } else if (dataLowercase === 'p') {
      isAm.value = false
    }
  }

  setTimeout(() => {
    timeInputPickerEl.value?.sync()
  }, 100)
}

// Picker
const timeInputPickerEl = ref<InstanceType<typeof TimeInputPicker>>()

// Watch `isAm` changes
watch(isAm, isAm => {
  if (preventNextIsAmChange.value || !is12h.value) {
    return
  }

  if (isTime(model.value)) {
    const { hh, mm } = delocalizedTimeParts.value

    if (isAm && +hh >= 12) {
      model.value = `${padStart(String(+hh % 12), 2, '0')}:${mm}`
    } else if (!isAm && +hh < 12) {
      model.value = `${+hh + 12}:${mm}`
    }
  } else {
    model.value = isAm ? '00:00' : '12:00'
  }
})

// Watch `modelValue` changes
watch(model, () => {
  preventNextIsAmChange.value = true
  isAm.value = +delocalizedTimeParts.value.hh < 12
})

const { path } = useInputValidationUtils(props)

defineExpose({
  focus,
  select,
  blur,
  clear,
  getInputElement,
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
    ref="wrapperEl"
    :has-content="!hasNoValue"
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
      :id="inputId"
      ref="el"
      :value="masked"
      flex="1"
      type="text"
      inputmode="decimal"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :label="label || placeholder"
      :name="name || path || label || placeholder"
      class="control"
      :class="[inputClass]"
      :style="inputStyle"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @input="handleInput"
      @blur="handleBlur"
    >

    <template #append>
      <div
        v-if="$slots.append || hasClearableBtn || (!readonly && !disabled)"
        flex="~ gap-x-1 center"
        @click="handleFocusOrClick"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

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

        <template v-if="!readonly && !disabled">
          <!-- AM / PM SWITCH -->
          <Btn
            v-if="is12h"
            flex="shrink"
            :label="isAm ? $t('general.am') : $t('general.pm')"
            size="xs"
            self-end
            color="ca"
            tabindex="-1"
            @click.stop.prevent="isAm = !isAm"
            @mousedown.stop.prevent=""
          />

          <div
            class="time-input-icon"
            i-bx:time-five
          />
        </template>
      </div>
    </template>

    <template #menu>
      <TimeInputPicker
        ref="timeInputPickerEl"
        v-model="model"
        v-model:is-am="isAm"
        v-model:prevent-next-is-am-change="preventNextIsAmChange"
        :reference-target="el"
        :is12h="is12h"
        :model-value-localized="modelValueLocalized"
        :shortcuts="shortcuts"
      />
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.time-input-icon {
  @apply cursor-pointer color-ca m-x-2 h-6 w-6;
}

.input-wrapper {
  &--xs,
  &--sm {
    .time-input-icon {
      @apply h-5 w-5;
    }
  }
}
</style>
