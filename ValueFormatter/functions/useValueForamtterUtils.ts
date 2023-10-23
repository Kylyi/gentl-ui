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
      'originalValue',
      'formatOriginalValue',
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
      case 'numberSimple':
      case 'intSimple':
        return formatNumber(value)

      case 'date':
      case 'DateTime':
      case 'dateSimple':
      case 'DateTimeSimple':
        return formatDate(value, 'short')

      case 'datetime':
      case 'datetimeSimple':
        return formatDate(value, 'long')

      case 'timestamp':
      case 'timestampSimple':
        return formatDate(value, 'timestamp')

      case 'yearMonth':
      case 'yearMonthSimple':
        return formatDate(value, 'yearMonth')

      case 'time':
      case 'timeSimple':
        return formatTime(value)

      case 'boolean':
      case 'bool':
      case 'booleanSimple':
      case 'boolSimple':
        return JSON.parse(value) ? $t('yes') : $t('no')

      case 'string':
      case 'stringSimple':
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
