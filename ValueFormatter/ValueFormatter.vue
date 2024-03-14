<script setup lang="ts">
// Types
import type { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

// Functions
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueForamtterUtils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<IValueFormatter>()

// Utils
const { formatValue } = useValueFormatterUtils()

const formattedValue = computed(() => {
  return formatValue(props.value, props.row, {
    dataType: props.dataType,
    format: props.format,
    emptyValue: props.emptyValue,
    predictDataType: props.predictDataType,
    resolveEnums: props.resolveEnums,
  })
})

const formattedOriginalValue = computed(() => {
  return formatValue(props.previousValue, props.row, {
    dataType: props.dataType,
    format: props.format,
    emptyValue: props.emptyValue,
    predictDataType: props.predictDataType,
    resolveEnums: props.resolveEnums,
  })
})
</script>

<template>
  <slot :val="formattedValue">
    <span v-bind="$attrs">
      {{ isNil(formattedValue) ? emptyValueString : formattedValue }}
    </span>
  </slot>

  <slot
    name="previousValue"
    :val="formattedOriginalValue"
  >
    <span
      v-if="previousValue !== undefined"
      v-bind="$attrs"
    >
      {{
        isNil(formattedOriginalValue)
          ? emptyValueString
          : formattedOriginalValue
      }}
    </span>
  </slot>
</template>
