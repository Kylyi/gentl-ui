import { config } from '~/config'

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
      'emptyValue',
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
      case 'DateTime':
        return formatDate(value, 'short')

      case 'datetime':
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
        return config.removePipes ? value.replace(/\|/g, '') : value

      default:
        return typeof value === 'string' && config.removePipes
          ? value.replace(/\|/g, '')
          : value
    }
  }

  return {
    getValueFormatterProps,
    formatValue,
  }
}
