// Types
import type { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

// Functions
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

export function useValueFormatterUtils() {
  // Utils
  const { formatNumber } = useNumber()
  const { formatDate, formatTime } = useDateUtils()

  function getValueFormatterProps(props: IValueFormatter) {
    return reactivePick(props, [
      'value',
      'dataType',
      'format',
      'emptyValueString',
      'row',
    ])
  }

  function formatValue(
    value: any,
    row?: any,
    options: {
      dataType?: DataType
      format?: (row: any, value: any) => any
      emptyValue?: any
    } = {}
  ): any {
    const { dataType, format, emptyValue } = options

    if (emptyValue === value) {
      return null
    }

    if (Array.isArray(value)) {
      return value
        .map(val => formatValue(val, row, options))
        .join(', ') as string
    }

    if (format) {
      return format(row ?? {}, value)
    }

    if (isNil(value)) {
      return ''
    }

    switch (dataType) {
      case 'number':
      case 'int':
        return formatNumber(value)

      case 'date':
        return formatDate(value, 'short')

      case 'datetime':
      case 'DateTime':
        return formatDate(value, 'long')

      case 'timestamp':
        return formatDate(value, 'timestamp')

      case 'yearMonth':
        return formatDate(value, 'yearMonth')

      case 'time':
        return formatTime(value)

      case 'boolean':
      case 'bool':
        return JSON.parse(value) ? $t('yes') : $t('no')

      case 'string':
      default:
        return value
    }
  }

  return {
    getValueFormatterProps,
    formatValue,
  }
}
