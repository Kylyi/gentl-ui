<script setup lang="ts">
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'
import { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

const props = defineProps<IValueFormatter>()

// UTILS
const { t } = useI18n()
const { formatNumber } = useNumber()
const { formatDate, formatTime } = useDateUtils()

const formattedValue = computedEager(() => {
  if (isNil(props.value)) {
    return ''
  }

  if (props.format) {
    return props.format(props.row ?? {}, props.value)
  }

  switch (props.dataType) {
    case 'number':
      return formatNumber(props.value)

    case 'date':
      return formatDate(props.value, 'short')

    case 'datetime':
      return formatDate(props.value, 'long')

    case 'yearMonth':
      return formatDate(props.value, 'yearMonth')

    case 'time':
      return formatTime(props.value)

    case 'boolean':
      return props.value ? t('yes') : t('no')

    case 'string':
    default:
      return props.value
  }
})
</script>

<template>
  <slot :val="formattedValue">
    <span>
      {{ formattedValue }}
    </span>
  </slot>
</template>
