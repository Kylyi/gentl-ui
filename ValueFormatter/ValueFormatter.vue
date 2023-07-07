<script setup lang="ts">
// Types
import type { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

// Functions
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueForamtterUtils'

const props = defineProps<IValueFormatter>()

// UTILS
const { formatValue } = useValueFormatterUtils()

const formattedValue = computedEager(() => {
  return formatValue(props.value, props.row, {
    dataType: props.dataType,
    format: props.format,
  })
})
</script>

<template>
  <slot :val="formattedValue">
    <span>
      {{ isNil(formattedValue) ? emptyValueString : formattedValue }}
    </span>
  </slot>
</template>
