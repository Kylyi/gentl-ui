import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'
import { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

export function useValueFormatterUtils() {
  // UTILS
  const { t } = useI18n()
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
    } = {}
  ) {
    const { dataType, format } = options

    if (isNil(value)) {
      return ''
    }

    if (format) {
      return format(row ?? {}, value)
    }

    switch (dataType) {
      case 'number':
        return formatNumber(value)

      case 'date':
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
        return value ? t('yes') : t('no')

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
