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

const formattedValue = computedEager(() => {
  return formatValue(props.value, props.row, {
    dataType: props.dataType,
    format: props.format,
    emptyValue: props.emptyValue,
  })
})
</script>

<template>
  <slot :val="formattedValue">
    <span v-bind="$attrs">
      {{ isNil(formattedValue) ? emptyValueString : formattedValue }}
    </span>
  </slot>
</template>
