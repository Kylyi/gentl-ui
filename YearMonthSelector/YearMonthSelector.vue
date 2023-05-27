<script setup lang="ts">
// TODO: MIN & MAX
// TYPES
import { IYearMonthSelectorProps } from '~~/components/YearMonthSelector/types/year-month-selector-props.type'

// COMPOSITION FUNCTIONS
import { useFieldUtils } from '~~/components/Field/functions/useFieldUtils'

// COMPONENTS
import Field from '~~/components/Field/Field.vue'
import MenuProxy from '~~/components/MenuProxy/MenuProxy.vue'

const props = withDefaults(defineProps<IYearMonthSelectorProps>(), {
  contentClass: 'cursor-pointer',
})
const emits = defineEmits<{
  (e: 'update:model-value', payload: Datetime): void
  (e: 'previous'): void
}>()

// UTILS
const { d } = useI18n()
const { getFieldProps } = useFieldUtils()

// LAYOUT
const fieldEl = ref<InstanceType<typeof Field>>()
const model = useVModel(props, 'modelValue', emits, {
  eventName: 'update:model-value',
})

const modelFormatted = computed(() => {
  if (!model.value) {
    return ''
  }

  return capitalize(d($date(model.value).valueOf(), 'yearMonth'))
})

const fieldProps = getFieldProps(props)

// PICKER
const menuProxyEl = ref<InstanceType<typeof MenuProxy>>()
const isPickerActive = ref(false)
const pickerState = ref('hide')

function handleMonthSelect(month: number) {
  model.value = $date(props.modelValue).month(month).startOf('month').valueOf()
  isPickerActive.value = false
}

function handleYearSelect(year: number) {
  model.value = $date(props.modelValue).year(year)
}

function handleYearNext() {
  model.value = $date(props.modelValue).add(1, 'year')
}

function handleYearPrevious() {
  model.value = $date(props.modelValue).subtract(1, 'year')
}

function handlePickerToggle() {
  if (props.readonly || props.disabled) {
    return
  }

  isPickerActive.value = !isPickerActive.value
}
</script>

<template>
  <Field
    ref="fieldEl"
    v-bind="fieldProps"
    :is-blurred="pickerState === 'hide'"
    :no-content="!modelFormatted"
    @click="handlePickerToggle"
  >
    {{ modelFormatted || '&nbsp;' }}

    <template #append>
      <Btn
        v-if="clearable && modelValue && !readonly && !disabled"
        icon="eva:close-fill h-6 w-6"
        color="ca"
        size="auto"
        h="7"
        w="7"
        @click.stop.prevent="model = emptyValue"
      />

      <div
        system-uicons:calendar-date
        class="picker-icon"
      />
    </template>

    <MenuProxy
      ref="menuProxyEl"
      v-model="isPickerActive"
      manual
      hide-header
      dense
      :reference-target="fieldEl"
      position="top"
      h="!auto"
      w="!auto"
      min-w="!280px"
      max-w="!400px"
      overflow="hidden"
      content-class="p-2 flex-gap-y-2"
      @before-show="pickerState = 'show'"
      @before-hide="pickerState = 'hide'"
    >
      <YearSelector
        :date="model"
        @year="handleYearSelect"
        @next="handleYearNext"
        @previous="handleYearPrevious"
      />

      <Separator />

      <MonthSelectorGrid
        :date="model"
        @month="handleMonthSelect"
      />
    </MenuProxy>
  </Field>
</template>

<style lang="scss" scoped>
.picker-icon {
  --apply: cursor-pointer color-ca m-x-2 h-6 w-6;
}
</style>
