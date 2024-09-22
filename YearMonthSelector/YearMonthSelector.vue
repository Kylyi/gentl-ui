<script setup lang="ts">
// TODO: MIN & MAX
// Types
import { type IYearMonthSelectorProps } from '~/components/YearMonthSelector/types/year-month-selector-props.type'

// Functions
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'

// Components
import Field from '~/components/Field/Field.vue'
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'

const props = defineProps<IYearMonthSelectorProps>()

defineEmits<{
  (e: 'update:modelValue', payload: Datetime): void
  (e: 'previous'): void
}>()

// Utils
const { d } = useI18n()

// Layout
const fieldEl = ref<ComponentInstance<typeof Field>>()
const model = defineModel<Datetime>()

const modelFormatted = computed(() => {
  if (!model.value) {
    return ''
  }

  return capitalize(d($date(model.value).valueOf(), 'yearMonth'))
})

// Picker
const referenceEl = ref<HTMLDivElement>()
const menuProxyEl = ref<ComponentInstance<typeof MenuProxy>>()
const isPickerActive = ref(false)
const pickerState = ref('hide')

function handleMonthSelect(month: number) {
  model.value = $date(props.modelValue).month(month).startOf('month').valueOf()
  isPickerActive.value = false

  fieldEl.value?.focus()
}

function handleYearSelect(year: number) {
  model.value = $date(props.modelValue).year(year).valueOf()
}

function handleYearNext() {
  model.value = $date(props.modelValue).add(1, 'year').valueOf()
}

function handleYearPrevious() {
  model.value = $date(props.modelValue).subtract(1, 'year').valueOf()
}

// Field
const { getFieldProps, handleFocusOrClick } = useFieldUtils({
  props,
  menuElRef: menuProxyEl,
})

const fieldProps = getFieldProps(props)

onMounted(() => {
  nextTick(() => {
    const fieldElDom = unrefElement(fieldEl as any)
    const wrapperElDom = fieldElDom?.querySelector('.input-wrapper-border')

    referenceEl.value = wrapperElDom
  })
})
</script>

<template>
  <Field
    ref="fieldEl"
    v-bind="fieldProps"
    :no-content="!modelFormatted"
    @focus="!readonly && handleFocusOrClick($event)"
  >
    <span>
      {{ modelFormatted || '&nbsp;' }}
    </span>

    <MenuProxy
      ref="menuProxyEl"
      v-model="isPickerActive"
      manual
      :reference-target="referenceEl"
      :fit="false"
      position="top"
      placement="bottom-start"
      h="!auto"
      w="!auto"
      min-w="!280px"
      max-w="!400px"
      tabindex="-1"
      no-uplift
      @before-show="pickerState = 'show'"
      @before-hide="pickerState = 'hide'"
    >
      <YearSelector
        :model-value="model"
        @year="handleYearSelect"
        @next="handleYearNext"
        @previous="handleYearPrevious"
      />

      <Separator />

      <MonthSelectorGrid
        :model-value="model"
        @month="handleMonthSelect"
      />
    </MenuProxy>

    <template #append>
      <Btn
        v-if="clearable && modelValue && !readonly && !disabled"
        icon="i-eva:close-fill h-6 w-6"
        color="ca"
        size="auto"
        h="7"
        w="7"
        @click.stop.prevent="model = emptyValue"
      />

      <div
        i-formkit:month
        class="picker-icon"
      />
    </template>
  </Field>
</template>

<style lang="scss" scoped>
.picker-icon {
  @applycursor-pointer color-ca m-x-2 h-5.5 w-5.5;
}
</style>
