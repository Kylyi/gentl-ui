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

const formattedOriginalValue = computedEager(() => {
  return formatValue(props.originalValue, props.row, {
    dataType: props.dataType,
    format: props.formatOriginalValue
      ? props.formatOriginalValue
      : props.format,
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

  <slot
    name="originalValue"
    :val="formattedOriginalValue"
  >
    <span
      v-if="originalValue !== undefined"
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
